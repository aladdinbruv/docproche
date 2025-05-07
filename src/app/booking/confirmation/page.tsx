"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { FaCheckCircle, FaCalendarAlt, FaClock, FaVideo, FaMapMarkerAlt, FaCreditCard } from "react-icons/fa";
import { MdSecurity, MdEmail } from "react-icons/md";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useAuth } from "@/hooks/useAuth";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: string;
  consultation_fee?: number;
}

const defaultDoctorImage = "https://via.placeholder.com/150";

export default function ConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const doctorId = searchParams.get("doctorId");
  const dateStr = searchParams.get("date");
  const timeSlotId = searchParams.get("timeSlot");
  const timeStr = searchParams.get("time");
  const consultationType = searchParams.get("type") as "video" | "inPerson" | null;
  const sessionId = searchParams.get("session_id");
  const canceled = searchParams.get("canceled");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [symptoms, setSymptoms] = useState<string>("");
  const { user } = useAuth();
  const supabase = createClientComponentClient();

  // Check payment status if coming back from Stripe
  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (sessionId) {
        try {
          // Find the appointment associated with this session
          const { data: paymentData, error: paymentError } = await supabase
            .from('payments')
            .select('appointment_id, status')
            .eq('transaction_id', sessionId);

          if (paymentError) {
            console.error("Error fetching payment:", paymentError);
            setIsSuccess(true); // Still show success even if there's an error
            return;
          }

          if (paymentData && paymentData.length > 0) {
            // If payment status is pending, update it to successful
            if (paymentData[0].status === 'pending') {
              // Make API call to update payment status
              const response = await fetch('/api/webhooks/stripe/manual-update', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  sessionId,
                }),
              });
              
              if (!response.ok) {
                console.error("Error updating payment status via API");
              }
            }
          }
          
          setIsSuccess(true);
        } catch (err) {
          console.error("Error updating payment status:", err);
          setIsSuccess(true); // Still show success page even if there was an error
        }
      }
    };
    
    checkPaymentStatus();
  }, [sessionId, supabase]);
  
  // If payment was canceled, show message
  useEffect(() => {
    if (canceled === 'true') {
      // If session was canceled, show message
      alert("Payment was canceled. Please try again or select a different payment method.");
    }
  }, [canceled]);
  
  useEffect(() => {
    if (!doctorId || !dateStr || !timeSlotId || !consultationType) {
      router.push('/doctors');
      return;
    }
    
    if (!user) {
      router.push(`/auth/login?redirectTo=/booking/confirmation?doctorId=${doctorId}&date=${dateStr}&timeSlot=${timeSlotId}&time=${timeStr}&type=${consultationType}`);
      return;
    }
    
    if (dateStr) {
      setSelectedDate(new Date(dateStr));
    }
    
    if (timeStr) {
      setSelectedTime(timeStr);
    }
    
    async function fetchAppointmentDetails() {
      setIsLoading(true);
      
      try {
        // Fetch doctor details
        const { data: doctorData, error: doctorError } = await supabase
          .from('users')
          .select('*')
          .eq('id', doctorId)
          .eq('role', 'doctor')
          .maybeSingle();
        
        if (doctorError) {
          console.error("Error fetching doctor:", doctorError);
          router.push('/doctors');
          return;
        }
        
        if (!doctorData) {
          console.error("Doctor not found");
          router.push('/doctors');
          return;
        }
        
        // Ensure doctor has all required fields
        const sanitizedDoctor = {
          ...doctorData,
          id: doctorData.id,
          image: doctorData.profile_image || defaultDoctorImage,
          name: doctorData.full_name || "Doctor",
          specialty: doctorData.specialty || "General Medicine",
          consultation_fee: doctorData.consultation_fee || 150
        };
        
        setDoctor(sanitizedDoctor);
        
        // Only fetch time slot details if time parameter is not provided
        if (!timeStr) {
          // Fetch time slot details
          const { data: timeSlotData, error: timeSlotError } = await supabase
            .from('time_slots')
            .select('*')
            .eq('id', timeSlotId)
            .maybeSingle();
          
          if (timeSlotError) {
            console.error("Error fetching time slot:", timeSlotError);
          } else if (timeSlotData) {
            setSelectedTime(timeSlotData.start_time);
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error in fetchAppointmentDetails:", err);
        setIsLoading(false);
        router.push('/doctors');
      }
    }
    
    fetchAppointmentDetails();
  }, [doctorId, dateStr, timeSlotId, timeStr, consultationType, router, supabase, user]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !doctorId || !selectedDate || !selectedTime) {
      alert("Missing required booking information");
      return;
    }
    
    setIsConfirming(true);
    
    try {
      // Create the appointment
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          patient_id: user.id,
          doctor_id: doctorId,
          date: selectedDate.toISOString().split('T')[0],
          time_slot: selectedTime,
          status: 'pending',
          consultation_type: consultationType === 'video' ? 'video' : 'in-person',
          symptoms,
          payment_status: 'unpaid',
          created_by: user.id
        })
        .select();
      
      if (appointmentError) {
        console.error("Error creating appointment:", appointmentError);
        throw new Error(`Failed to create appointment: ${appointmentError.message}`);
      }
      
      if (!appointmentData || appointmentData.length === 0) {
        throw new Error("No appointment data returned from the server");
      }
      
      const appointmentId = appointmentData[0].id;
      
      // Calculate the appointment amount
      const appointmentAmount = doctor?.consultation_fee || 150;
      
      // Create Stripe checkout session
      try {
        const response = await fetch('/api/payments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            appointmentId: appointmentId,
            amount: appointmentAmount,
            successUrl: `${window.location.origin}/booking/confirmation?doctorId=${doctorId}&date=${dateStr}&timeSlot=${timeSlotId}&time=${selectedTime}&type=${consultationType}&session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${window.location.origin}/booking/confirmation?doctorId=${doctorId}&date=${dateStr}&timeSlot=${timeSlotId}&time=${selectedTime}&type=${consultationType}&canceled=true`
          }),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Payment API error (${response.status}): ${errorText}`);
        }
        
        const result = await response.json();
        
        if (!result.url) {
          throw new Error("No redirect URL returned from payment service");
        }
        
        // Redirect to Stripe checkout
        window.location.href = result.url;
      } catch (paymentError) {
        console.error("Payment creation error:", paymentError);
        
        // Attempt to clean up the appointment since payment failed
        await supabase
          .from('appointments')
          .delete()
          .eq('id', appointmentId);
          
        throw new Error(`Failed to set up payment: ${paymentError instanceof Error ? paymentError.message : String(paymentError)}`);
      }
    } catch (err) {
      console.error("Error in appointment process:", err);
      alert(`There was an error creating your appointment: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsConfirming(false);
    }
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
  
  if (isSuccess) {
    return (
      <motion.div 
        className="min-h-screen bg-gray-50 py-20 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="mb-6"
          >
            <FaCheckCircle className="mx-auto text-green-500 text-6xl" />
          </motion.div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Appointment Confirmed!</h1>
          <p className="text-gray-600 mb-6">
            Your appointment with {doctor?.name} has been scheduled for {selectedDate?.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })} at {selectedTime}.
          </p>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="text-blue-800 flex items-center justify-center">
              <MdEmail className="mr-2" />
              Confirmation details have been sent to your email
            </p>
          </div>
          
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Go to Dashboard
          </button>
        </div>
      </motion.div>
    );
  }
  
  return (
    <motion.div 
      className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Complete Your Booking
          </h1>
          <p className="mt-3 text-xl text-gray-500">
            Confirm your appointment details and payment
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Order Summary */}
          <motion.div 
            className="bg-white rounded-xl shadow-md overflow-hidden md:col-span-1"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-4 mb-4">Appointment Summary</h3>
              
              {doctor && (
                <div className="mb-6">
                  <div className="flex items-center mb-4">
                    <div className="relative h-12 w-12 rounded-full overflow-hidden mr-3">
                      <Image 
                        src={doctor.image || defaultDoctorImage}
                        alt={doctor.name || "Doctor"}
                        fill
                        sizes="48px"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{doctor.name}</h4>
                      <p className="text-sm text-gray-500">{doctor.specialty}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <FaCalendarAlt className="text-blue-500 mt-1 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Date</p>
                    <p className="text-gray-900">
                      {selectedDate?.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FaClock className="text-blue-500 mt-1 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Time</p>
                    <p className="text-gray-900">{selectedTime}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  {consultationType === "video" ? (
                    <FaVideo className="text-blue-500 mt-1 mr-3" />
                  ) : (
                    <FaMapMarkerAlt className="text-blue-500 mt-1 mr-3" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-700">Consultation Type</p>
                    <p className="text-gray-900">
                      {consultationType === "video" ? "Video Consultation" : "In-Person Visit"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {consultationType === "video" 
                        ? "You'll receive a link before the appointment" 
                        : "New York Medical Center, 5th Avenue"}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Consultation Fee</span>
                  <span className="font-medium">$150.00</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Platform Fee</span>
                  <span className="font-medium">$10.00</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                  <span className="font-medium text-gray-900">Total</span>
                  <span className="font-bold text-gray-900">$160.00</span>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Payment Form */}
          <motion.div 
            className="bg-white rounded-xl shadow-md overflow-hidden md:col-span-2"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 flex items-center mb-6">
                <FaCreditCard className="mr-2 text-blue-500" /> Payment Details
              </h3>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-1">
                      Symptoms or Reason for Visit
                    </label>
                    <textarea
                      id="symptoms"
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Please describe your symptoms or reason for this appointment"
                      rows={4}
                    />
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg text-blue-700 text-sm flex items-start">
                    <MdSecurity className="text-blue-500 text-lg mt-0.5 mr-2 flex-shrink-0" />
                    <p>
                      Your payment will be securely processed using Stripe. You will be redirected to their secure payment page.
                    </p>
                  </div>
                </div>
                
                <div className="mt-8">
                  <button
                    type="submit"
                    disabled={isConfirming}
                    className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      isConfirming ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isConfirming ? (
                      <>
                        <motion.div 
                          className="h-5 w-5 border-t-2 border-white border-solid rounded-full mr-2"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaCreditCard className="mr-2" />
                        Proceed to Payment (${(doctor?.consultation_fee || 150) + 10}.00)
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
} 