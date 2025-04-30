"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { FaCheckCircle, FaCalendarAlt, FaClock, FaVideo, FaMapMarkerAlt, FaUserMd, FaCreditCard } from "react-icons/fa";
import { MdSecurity, MdEmail, MdPhone } from "react-icons/md";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: string;
}

export default function ConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const doctorId = searchParams.get("doctorId");
  const dateStr = searchParams.get("date");
  const timeSlotId = searchParams.get("timeSlot");
  const consultationType = searchParams.get("type") as "video" | "inPerson";
  
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVC, setCardCVC] = useState("");
  const [nameOnCard, setNameOnCard] = useState("");
  
  // Mock data loading
  useEffect(() => {
    if (dateStr) {
      setSelectedDate(new Date(dateStr));
    }
    
    // Simulate API fetch for doctor and time slot
    setTimeout(() => {
      setDoctor({
        id: doctorId || "d1",
        name: "Dr. Sarah Johnson",
        specialty: "Cardiologist",
        image: "https://randomuser.me/api/portraits/women/76.jpg",
      });
      
      // Mock time based on timeSlotId
      const times = {
        t1: "09:00 AM",
        t2: "10:00 AM",
        t3: "11:00 AM",
        t4: "01:00 PM",
        t5: "02:00 PM",
        t6: "03:00 PM",
        t7: "04:00 PM",
        t8: "05:00 PM",
      };
      
      setSelectedTime(times[timeSlotId as keyof typeof times] || "");
      setIsLoading(false);
    }, 1000);
  }, [doctorId, dateStr, timeSlotId]);
  
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, '');
    let formatted = '';
    
    for (let i = 0; i < input.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += ' ';
      }
      formatted += input[i];
    }
    
    setCardNumber(formatted.slice(0, 19)); // Limit to 16 digits + 3 spaces
  };
  
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, '');
    let formatted = '';
    
    if (input.length > 0) {
      formatted = input.slice(0, 2);
      if (input.length > 2) {
        formatted += '/' + input.slice(2, 4);
      }
    }
    
    setCardExpiry(formatted);
  };
  
  const handleCVCChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, '');
    setCardCVC(input.slice(0, 3));
  };
  
  const validateForm = () => {
    return (
      cardNumber.replace(/\s/g, '').length === 16 &&
      cardExpiry.length === 5 &&
      cardCVC.length === 3 &&
      nameOnCard.trim().length > 0
    );
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert("Please fill in all payment details correctly");
      return;
    }
    
    setIsConfirming(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsConfirming(false);
      setIsSuccess(true);
      
      // Redirect to dashboard or show success message
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    }, 2000);
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
                        src={doctor.image} 
                        alt={doctor.name}
                        layout="fill"
                        objectFit="cover"
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
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">
                      Name on Card
                    </label>
                    <input
                      type="text"
                      id="cardName"
                      value={nameOnCard}
                      onChange={(e) => setNameOnCard(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="cardNumber"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="1234 5678 9012 3456"
                        required
                      />
                      <motion.div 
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <MdSecurity className="text-gray-400 text-xl" />
                      </motion.div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700 mb-1">
                        Expiration Date
                      </label>
                      <input
                        type="text"
                        id="cardExpiry"
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="MM/YY"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="cardCVC" className="block text-sm font-medium text-gray-700 mb-1">
                        CVC/CVV
                      </label>
                      <input
                        type="text"
                        id="cardCVC"
                        value={cardCVC}
                        onChange={handleCVCChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="123"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg text-blue-700 text-sm flex items-start">
                    <MdSecurity className="text-blue-500 text-lg mt-0.5 mr-2 flex-shrink-0" />
                    <p>
                      Your payment information is encrypted and secure. We do not store your card details.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Contact Information</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                        <MdEmail className="text-gray-500 mr-2" />
                        <span className="text-gray-700">patient@example.com</span>
                      </div>
                      
                      <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                        <MdPhone className="text-gray-500 mr-2" />
                        <span className="text-gray-700">+1 (555) 123-4567</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <button
                    type="submit"
                    disabled={isConfirming || !validateForm()}
                    className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      isConfirming || !validateForm() ? 'opacity-70 cursor-not-allowed' : ''
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
                      'Confirm and Pay $160.00'
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