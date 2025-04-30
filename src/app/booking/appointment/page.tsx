"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { FaCalendarAlt, FaClock, FaVideo, FaPhoneAlt, FaUserMd, FaMapMarkerAlt } from "react-icons/fa";
import { MdPayment } from "react-icons/md";
import { Calendar } from "@/components/Calendar";

interface TimeSlot {
  id: string;
  time: string;
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
  availableDates?: string[];
}

export default function AppointmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const doctorId = searchParams.get("doctorId");
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [consultationType, setConsultationType] = useState<"video" | "inPerson">("video");
  const [isLoading, setIsLoading] = useState(true);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  
  // Mock data for demo
  useEffect(() => {
    // Simulate API call to fetch doctor data
    setTimeout(() => {
      setDoctor({
        id: doctorId || "d1",
        name: "Dr. Sarah Johnson",
        specialty: "Cardiologist",
        image: "https://randomuser.me/api/portraits/women/76.jpg",
        rating: 4.8,
        reviewCount: 124,
        price: 150,
        availableDates: [
          new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          new Date(Date.now() + 86400000 * 2).toISOString(), // Day after tomorrow
          new Date(Date.now() + 86400000 * 3).toISOString(), 
          new Date(Date.now() + 86400000 * 5).toISOString(),
        ]
      });
      
      setTimeSlots([
        { id: "t1", time: "09:00 AM", available: true },
        { id: "t2", time: "10:00 AM", available: true },
        { id: "t3", time: "11:00 AM", available: false },
        { id: "t4", time: "01:00 PM", available: true },
        { id: "t5", time: "02:00 PM", available: true },
        { id: "t6", time: "03:00 PM", available: false },
        { id: "t7", time: "04:00 PM", available: true },
        { id: "t8", time: "05:00 PM", available: true },
      ]);
      
      setIsLoading(false);
    }, 1000);
  }, [doctorId]);
  
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
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
    
    router.push(`/booking/confirmation?doctorId=${doctor?.id}&date=${selectedDate.toISOString()}&timeSlot=${selectedTimeSlot}&type=${consultationType}`);
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
          <p className="mt-2">The doctor you're looking for doesn't exist or has been removed.</p>
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
                    src={doctor.image} 
                    alt={doctor.name}
                    layout="fill"
                    objectFit="cover"
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
                    <FaMapMarkerAlt className="mr-1 text-red-500" /> New York Medical Center
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
                    availableDates={doctor.availableDates}
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
                        {slot.time}
                      </button>
                    ))}
                  </div>
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
                  {selectedTimeSlot ? timeSlots.find(slot => slot.id === selectedTimeSlot)?.time : 'Not selected'}
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
                    : "Visit New York Medical Center"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
} 