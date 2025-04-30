"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaStar, FaMapMarkerAlt, FaUserMd, FaCalendarAlt } from "react-icons/fa";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: string;
  location: string;
  rating: number;
  reviewCount: number;
  price: number;
  available: boolean;
}

export default function DoctorsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [specialty, setSpecialty] = useState<string | null>(null);
  
  useEffect(() => {
    // Mock API call to fetch doctors
    setTimeout(() => {
      setDoctors([
        {
          id: "d1",
          name: "Dr. Sarah Johnson",
          specialty: "Cardiologist",
          image: "https://randomuser.me/api/portraits/women/76.jpg",
          location: "New York Medical Center",
          rating: 4.8,
          reviewCount: 124,
          price: 150,
          available: true
        },
        {
          id: "d2",
          name: "Dr. Michael Williams",
          specialty: "Dermatologist",
          image: "https://randomuser.me/api/portraits/men/32.jpg",
          location: "Manhattan Skin Clinic",
          rating: 4.6,
          reviewCount: 98,
          price: 130,
          available: true
        },
        {
          id: "d3",
          name: "Dr. Emily Roberts",
          specialty: "Pediatrician",
          image: "https://randomuser.me/api/portraits/women/45.jpg",
          location: "Children's Medical Center",
          rating: 4.9,
          reviewCount: 156,
          price: 120,
          available: true
        },
        {
          id: "d4",
          name: "Dr. James Anderson",
          specialty: "Neurologist",
          image: "https://randomuser.me/api/portraits/men/67.jpg",
          location: "Neuroscience Institute",
          rating: 4.7,
          reviewCount: 87,
          price: 180,
          available: false
        },
        {
          id: "d5",
          name: "Dr. Rebecca Chen",
          specialty: "Orthopedic Surgeon",
          image: "https://randomuser.me/api/portraits/women/23.jpg",
          location: "Orthopedic Specialists",
          rating: 4.9,
          reviewCount: 112,
          price: 200,
          available: true
        },
        {
          id: "d6",
          name: "Dr. David Thompson",
          specialty: "Psychiatrist",
          image: "https://randomuser.me/api/portraits/men/92.jpg",
          location: "Mental Wellness Center",
          rating: 4.5,
          reviewCount: 76,
          price: 160,
          available: true
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);
  
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = !specialty || doctor.specialty === specialty;
    return matchesSearch && matchesSpecialty;
  });
  
  const specialties = [...new Set(doctors.map(doctor => doctor.specialty))];
  
  const handleDoctorClick = (doctorId: string) => {
    router.push(`/doctors/${doctorId}`);
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
            Find the Right Doctor
          </h1>
          <p className="mt-3 text-xl text-gray-500">
            Book appointments with the best doctors near you
          </p>
        </div>
        
        {/* Search and Filter */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <input 
                type="text"
                placeholder="Search doctors by name or specialty..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              value={specialty || ""}
              onChange={(e) => setSpecialty(e.target.value || null)}
            >
              <option value="">All Specialties</option>
              {specialties.map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Doctors List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDoctors.map((doctor, index) => (
            <motion.div 
              key={doctor.id}
              className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleDoctorClick(doctor.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="relative h-16 w-16 rounded-full overflow-hidden mr-4">
                    <Image 
                      src={doctor.image} 
                      alt={doctor.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{doctor.name}</h3>
                    <p className="text-sm text-blue-600 flex items-center">
                      <FaUserMd className="mr-1" /> {doctor.specialty}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <FaMapMarkerAlt className="text-red-500 mr-1" />
                  <span>{doctor.location}</span>
                </div>
                
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400 mr-1">
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar className={doctor.rating < 4.8 ? "text-yellow-200" : ""} />
                  </div>
                  <span className="text-sm text-gray-600">{doctor.rating} ({doctor.reviewCount} reviews)</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-gray-500 text-sm">Consultation Fee</span>
                    <p className="font-bold text-gray-900">${doctor.price}</p>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${doctor.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {doctor.available ? "Available Today" : "Unavailable"}
                  </div>
                </div>
                
                <button
                  className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg font-medium flex items-center justify-center hover:bg-blue-700 transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/booking/appointment?doctorId=${doctor.id}`);
                  }}
                >
                  <FaCalendarAlt className="mr-2" />
                  Book Appointment
                </button>
              </div>
            </motion.div>
          ))}
        </div>
        
        {filteredDoctors.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-gray-900 mb-2">No doctors found</h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </motion.div>
  );
} 