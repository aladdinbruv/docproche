"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { FaCalendarAlt, FaClock, FaVideo, FaUserMd, FaMapMarkerAlt } from "react-icons/fa";
import { MdPayment } from "react-icons/md";
import { Calendar } from "@/components/Calendar";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useAuth } from "@/hooks/useAuth";

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: string;
  rating: number;
  reviewCount: number;
  price: number;
  availableDays?: string[];
}

const defaultDoctorImage = "https://via.placeholder.com/150";

export default function AppointmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const doctorId = searchParams.get("doctorId");
  const [isLoading, setIsLoading] = useState(true);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [consultationType, setConsultationType] = useState<"video" | "inPerson">("video");
  const { user } = useAuth();
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (!doctorId) {
      router.push('/doctors');
      return;
    }
    
    if (!user) {
      router.push(`/auth/login?redirectTo=/booking/appointment?doctorId=${doctorId}`);
      return;
    }
    
    async function fetchDoctorInfo() {
      setIsLoading(true);
      
      try {
        // Fetch doctor information
        const { data: doctorData, error: doctorError } = await supabase
          .from('users')
          .select('*')
          .eq('id', doctorId)
          .eq('role', 'doctor')
          .eq('is_active', true)
          .single();
          
        if (doctorError || !doctorData) {
          console.error("Error fetching doctor:", doctorError);
          router.push('/doctors');
          return;
        }
        
        // Ensure doctor has all required fields
        const sanitizedDoctor = {
          ...doctorData,
          image: doctorData.profile_image || defaultDoctorImage,
          name: doctorData.full_name || "Doctor",
          specialty: doctorData.specialty || "General Medicine",
          rating: doctorData.rating || 5.0,
          reviewCount: doctorData.review_count || 0,
          price: doctorData.consultation_fee || 150
        };
        
        setDoctor(sanitizedDoctor);
        
        // Fetch doctor's available days from time_slots table
        const { data: availableDaysData, error: availableDaysError } = await supabase
          .from('time_slots')
          .select('day_of_week')
          .eq('doctor_id', doctorId)
          .eq('is_available', true);
          
        if (availableDaysError) {
          console.error("Error fetching available days:", availableDaysError);
        }
        
        // Process available dates from time slots
        const uniqueDays = [...new Set(availableDaysData?.map(slot => slot.day_of_week) || [])];
        const today = new Date();
        const nextMonth = new Date();
        nextMonth.setMonth(today.getMonth() + 1);
        
        // Generate available dates based on doctor's available days
        const dates = [];
        const current = new Date(today);
        
        while (current <= nextMonth) {
          // Check if day of week is in available days
          if (uniqueDays.includes(current.getDay())) {
            dates.push(new Date(current).toISOString());
          }
          current.setDate(current.getDate() + 1);
        }
        
        setAvailableDates(dates);
        setIsLoading(false);
      } catch (err) {
        console.error("Error in fetchDoctorInfo:", err);
        setIsLoading(false);
        router.push('/doctors');
      }
    }
    
    fetchDoctorInfo();
  }, [doctorId, router, supabase, user]);
  
  // Fetch time slots when date is selected
  useEffect(() => {
    if (!selectedDate || !doctorId) return;
    
    async function fetchTimeSlots() {
      setLoadingTimeSlots(true);
      setTimeSlots([]);
      
      try {
        const response = await fetch(`/api/appointments/available-slots?doctorId=${doctorId}&date=${selectedDate?.toISOString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch available time slots');
        }
        
        const data = await response.json();
        setTimeSlots(data.time_slots || []);
      } catch (error) {
        console.error("Error fetching time slots:", error);
      } finally {
        setLoadingTimeSlots(false);
      }
    }
    
    fetchTimeSlots();
  }, [selectedDate, doctorId]);
  
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTimeSlot("");
  };
  
  const handleTimeSelect = (timeId: string) => {
    setSelectedTimeSlot(timeId);
  };
  
  const handleConsultationTypeChange = (type: "video" | "inPerson") => {
    setConsultationType(type);
  };
  
  const handleContinue = () => {
    if (!selectedDate || !selectedTimeSlot) {
      alert("Please select both a date and time for your appointment");
      return;
    }
    
    const selectedSlot = timeSlots.find(slot => slot.id === selectedTimeSlot);
    
    if (!selectedSlot) {
      alert("Please select a valid time slot");
      return;
    }
    
    router.push(`/booking/confirmation?doctorId=${doctor?.id}&date=${selectedDate.toISOString()}&timeSlot=${selectedTimeSlot}&time=${selectedSlot.startTime}&type=${consultationType}`);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <motion.div 
          className="h-16 w-16 border-t-4 border-blue-500 border-solid rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }
  
  if (!doctor) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500">Doctor not found</h2>
          <p className="mt-2">The doctor you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <button 
            onClick={() => router.push('/doctors')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Browse Doctors
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <motion.div 
      className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Book Your Appointment
          </h1>
          <p className="mt-3 text-xl text-gray-500">
            Select your preferred date, time and consultation type
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Doctor Info Panel */}
          <motion.div 
            className="bg-white rounded-xl shadow-md overflow-hidden"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="relative h-16 w-16 rounded-full overflow-hidden mr-4">
                  <Image 
                    src={doctor.image || defaultDoctorImage}
                    alt={doctor.name || "Doctor"}
                    fill
                    sizes="64px"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{doctor.name}</h3>
                  <p className="flex items-center text-gray-500">
                    <FaUserMd className="mr-1 text-blue-500" /> {doctor.specialty}
                  </p>
                </div>
              </div>
              
              <div className="mt-6 border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Rating</span>
                  <div className="flex items-center">
                    <span className="text-yellow-500">★★★★★</span>
                    <span className="ml-1 text-gray-600">{doctor.rating} ({doctor.reviewCount} reviews)</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Consultation Fee</span>
                  <span className="font-medium text-gray-900">${doctor.price}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Location</span>
                  <span className="text-gray-900 flex items-center">
                    <FaMapMarkerAlt className="mr-1 text-red-500" /> Medical Center
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Calendar and Time Selection */}
          <motion.div 
            className="bg-white rounded-xl shadow-md overflow-hidden md:col-span-2"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                <FaCalendarAlt className="mr-2 text-blue-500" /> Select Date & Time
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Calendar Component */}
                <div>
                  <Calendar 
                    availableDates={availableDates}
                    onSelectDate={handleDateSelect}
                    selectedDate={selectedDate}
                    minDate={new Date()}
                  />
                </div>
                
                {/* Time Slots */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <FaClock className="mr-1 text-blue-500" /> Available Time Slots
                  </h4>
                  
                  {loadingTimeSlots ? (
                    <div className="flex justify-center items-center py-8">
                      <motion.div 
                        className="h-8 w-8 border-t-2 border-blue-500 border-solid rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    </div>
                  ) : selectedDate ? (
                    timeSlots.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {timeSlots.map((slot) => (
                          <button
                            key={slot.id}
                            onClick={() => handleTimeSelect(slot.id)}
                            disabled={!slot.available}
                            className={`p-2 text-center rounded-lg transition-all transform hover:scale-105 ${
                              selectedTimeSlot === slot.id
                                ? 'bg-blue-500 text-white'
                                : slot.available
                                ? 'bg-white border border-gray-200 hover:border-blue-300'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {slot.startTime}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-gray-500">
                        <p>No available time slots for this date.</p>
                        <p className="text-sm">Please select another date.</p>
                      </div>
                    )
                  ) : (
                    <div className="py-8 text-center text-gray-500">
                      <p>Please select a date to see available time slots.</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Consultation Type */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Consultation Type</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => handleConsultationTypeChange("video")}
                    className={`p-4 rounded-lg border flex items-center transition-all ${
                      consultationType === "video"
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className={`p-3 rounded-full ${
                      consultationType === "video" ? 'bg-blue-500' : 'bg-gray-100'
                    }`}>
                      <FaVideo className={`${
                        consultationType === "video" ? 'text-white' : 'text-gray-500'
                      }`} />
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium">Video Consultation</h4>
                      <p className="text-sm text-gray-500">Meet online via secure video call</p>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleConsultationTypeChange("inPerson")}
                    className={`p-4 rounded-lg border flex items-center transition-all ${
                      consultationType === "inPerson"
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className={`p-3 rounded-full ${
                      consultationType === "inPerson" ? 'bg-blue-500' : 'bg-gray-100'
                    }`}>
                      <FaMapMarkerAlt className={`${
                        consultationType === "inPerson" ? 'text-white' : 'text-gray-500'
                      }`} />
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium">In-Person Visit</h4>
                      <p className="text-sm text-gray-500">Visit the doctor at the clinic</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Continue Button */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end">
              <motion.button
                onClick={handleContinue}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium flex items-center hover:bg-blue-700 transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={!selectedDate || !selectedTimeSlot}
              >
                <MdPayment className="mr-2" />
                Continue to Payment
              </motion.button>
            </div>
          </motion.div>
        </div>
        
        {/* Summary Section */}
        {selectedDate && selectedTimeSlot && (
          <motion.div 
            className="mt-8 bg-white rounded-xl shadow-md overflow-hidden"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Your Appointment Summary</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <FaUserMd className="text-blue-500 mr-2" />
                    <h4 className="font-medium">Doctor</h4>
                  </div>
                  <p className="text-gray-700">{doctor.name}</p>
                  <p className="text-sm text-gray-500">{doctor.specialty}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <FaCalendarAlt className="text-blue-500 mr-2" />
                    <h4 className="font-medium">Date & Time</h4>
                  </div>
                  <p className="text-gray-700">
                    {selectedDate ? selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : 'Not selected'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {timeSlots.find(slot => slot.id === selectedTimeSlot)?.startTime || 'Not selected'}
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    {consultationType === "video" ? (
                      <FaVideo className="text-blue-500 mr-2" />
                    ) : (
                      <FaMapMarkerAlt className="text-blue-500 mr-2" />
                    )}
                    <h4 className="font-medium">Consultation Type</h4>
                  </div>
                  <p className="text-gray-700">
                    {consultationType === "video" ? "Video Consultation" : "In-Person Visit"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {consultationType === "video" 
                      ? "You'll receive a link before the appointment" 
                      : "Visit Medical Center"}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
} 