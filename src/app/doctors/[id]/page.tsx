"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaStar, FaCalendarAlt, FaMapMarkerAlt, FaUserMd, FaClock } from "react-icons/fa";

// Sample doctor data, would come from database in real app
const doctorData = {
  id: 1,
  name: "Dr. Sarah Johnson",
  specialty: "Cardiologist",
  location: "New York, NY",
  address: "123 Medical Center Blvd, New York, NY 10001",
  phone: "(212) 555-1234",
  email: "dr.johnson@doctoproche.com",
  rating: 4.8,
  experience: 12,
  bio: "Dr. Sarah Johnson is a board-certified cardiologist with over 12 years of experience in treating various heart conditions. She specializes in preventive cardiology, heart failure management, and cardiac rehabilitation. Dr. Johnson completed her medical degree at Harvard Medical School and her residency at Massachusetts General Hospital.",
  education: [
    {
      degree: "MD",
      institution: "Harvard Medical School",
      year: "2005-2009"
    },
    {
      degree: "Residency in Internal Medicine",
      institution: "Massachusetts General Hospital",
      year: "2009-2012"
    },
    {
      degree: "Fellowship in Cardiology",
      institution: "Columbia University Medical Center",
      year: "2012-2015"
    }
  ],
  image: "/images/doctor-1.jpg",
  available_days: ["Monday", "Tuesday", "Thursday", "Friday"],
  available_times: ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"],
  consultation_fee: 150,
  languages: ["English", "Spanish"],
  reviews: [
    {
      id: 1,
      patient: "John D.",
      rating: 5,
      date: "2023-07-15",
      comment: "Dr. Johnson was incredibly thorough and took the time to explain everything clearly. Highly recommend!"
    },
    {
      id: 2,
      patient: "Maria G.",
      rating: 4,
      date: "2023-06-20",
      comment: "Very professional and knowledgeable. The wait time was a bit longer than expected."
    },
    {
      id: 3,
      patient: "Robert T.",
      rating: 5,
      date: "2023-05-05",
      comment: "Dr. Johnson's expertise in cardiology is outstanding. She provided excellent care and follow-up."
    }
  ]
};

export default function DoctorDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const doctorId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  
  useEffect(() => {
    // Mock API call to fetch doctor details
    setTimeout(() => {
      setDoctor({
        id: doctorId,
        name: "Dr. Sarah Johnson",
        specialty: "Cardiologist",
        image: "https://randomuser.me/api/portraits/women/76.jpg",
        bio: "Dr. Sarah Johnson is a board-certified cardiologist with over 15 years of experience in treating various heart conditions. She specializes in preventive cardiology and heart disease management.",
        experience: "15+ years",
        education: "MD from Harvard Medical School, Residency at Mass General Hospital",
        rating: 4.8,
        reviewCount: 124,
        location: "New York Medical Center",
        price: 150,
        languages: ["English", "Spanish"],
        availability: {
          days: ["Monday", "Tuesday", "Wednesday", "Friday"],
          hours: "9:00 AM - 5:00 PM"
        }
      });
      setIsLoading(false);
    }, 1000);
  }, [doctorId]);
  
  const handleBookAppointment = () => {
    router.push(`/booking/appointment?doctorId=${doctorId}`);
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
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="md:flex">
            {/* Doctor Profile Image and Quick Info */}
            <motion.div 
              className="md:flex-shrink-0 p-6 md:w-1/3 bg-blue-50"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="relative w-40 h-40 rounded-full overflow-hidden mb-4 border-4 border-white shadow-lg">
                  <Image 
                    src={doctor.image} 
                    alt={doctor.name}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-full"
                  />
                </div>
                
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{doctor.name}</h1>
                <p className="flex items-center text-blue-600 mb-4">
                  <FaUserMd className="mr-1" /> {doctor.specialty}
                </p>
                
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar className="text-yellow-200" />
                  </div>
                  <span className="ml-2 text-gray-600">{doctor.rating} ({doctor.reviewCount} reviews)</span>
                </div>
                
                <div className="w-full space-y-3">
                  <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                    <FaMapMarkerAlt className="text-red-500 mr-3" />
                    <span className="text-gray-700">{doctor.location}</span>
                  </div>
                  
                  <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                    <FaClock className="text-blue-500 mr-3" />
                    <div className="text-left">
                      <span className="text-gray-700 block">{doctor.availability.hours}</span>
                      <span className="text-sm text-gray-500">{doctor.availability.days.join(", ")}</span>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <span className="font-medium text-gray-900">Consultation Fee:</span>
                    <span className="ml-2 text-blue-600 font-bold">${doctor.price}</span>
                  </div>
                </div>
                
                <motion.button
                  onClick={handleBookAppointment}
                  className="mt-6 w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-8"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaCalendarAlt className="mr-2" />
                  Book Appointment
                </motion.button>
              </div>
            </motion.div>
            
            {/* Doctor Details */}
            <div className="p-8 md:w-2/3">
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About Doctor</h2>
                <p className="text-gray-700 leading-relaxed">{doctor.bio}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div 
                  className="bg-gray-50 p-5 rounded-lg"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="font-semibold text-gray-900 mb-2">Education</h3>
                  <p className="text-gray-700">{doctor.education}</p>
                </motion.div>
                
                <motion.div 
                  className="bg-gray-50 p-5 rounded-lg"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="font-semibold text-gray-900 mb-2">Experience</h3>
                  <p className="text-gray-700">{doctor.experience}</p>
                </motion.div>
                
                <motion.div 
                  className="bg-gray-50 p-5 rounded-lg"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <h3 className="font-semibold text-gray-900 mb-2">Languages</h3>
                  <p className="text-gray-700">{doctor.languages.join(", ")}</p>
                </motion.div>
                
                <motion.div 
                  className="bg-gray-50 p-5 rounded-lg"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <h3 className="font-semibold text-gray-900 mb-2">Specialization</h3>
                  <ul className="list-disc list-inside text-gray-700">
                    <li>Preventive Cardiology</li>
                    <li>Heart Disease Management</li>
                    <li>Cardiac Rehabilitation</li>
                    <li>Hypertension Management</li>
                  </ul>
                </motion.div>
              </div>
              
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Patient Reviews</h3>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <span className="text-yellow-400 flex">
                        <FaStar />
                        <FaStar />
                        <FaStar />
                        <FaStar />
                        <FaStar />
                      </span>
                      <span className="ml-2 font-medium">John D.</span>
                      <span className="text-gray-500 text-sm ml-auto">2 weeks ago</span>
                    </div>
                    <p className="text-gray-700">
                      Dr. Johnson was extremely thorough and took the time to explain everything in detail. Highly recommend!
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <span className="text-yellow-400 flex">
                        <FaStar />
                        <FaStar />
                        <FaStar />
                        <FaStar />
                        <FaStar className="text-yellow-200" />
                      </span>
                      <span className="ml-2 font-medium">Maria R.</span>
                      <span className="text-gray-500 text-sm ml-auto">1 month ago</span>
                    </div>
                    <p className="text-gray-700">
                      Great doctor who is very knowledgeable and caring. The office staff was also very helpful.
                    </p>
                  </div>
                </div>
                
                <button className="mt-4 text-blue-600 hover:text-blue-800 transition font-medium flex items-center">
                  View all {doctor.reviewCount} reviews
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 