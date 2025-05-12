"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaStar, FaMapMarkerAlt, FaUserMd, FaCalendarAlt } from "react-icons/fa";
import { useDoctors } from "@/hooks/useDoctors";

export const revalidate = 3600; // Revalidate every hour

export default function DoctorsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [specialty, setSpecialty] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const { doctors, isLoading, error, pagination } = useDoctors({
    specialty: specialty || undefined,
    page: currentPage,
    limit: 9
  });
  
  const filteredDoctors = doctors.filter(doctor => {
    return doctor.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
           doctor.specialty?.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  // Extract unique specialties from doctor data
  const specialties = [...new Set(doctors.filter(d => d.specialty).map(d => d.specialty))];
  
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
  
  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Doctors</h2>
          <p className="text-gray-600">{error}</p>
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
                      src={doctor.profile_image || "https://via.placeholder.com/150"} 
                      alt={doctor.full_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{doctor.full_name}</h3>
                    <p className="text-sm text-blue-600 flex items-center">
                      <FaUserMd className="mr-1" /> {doctor.specialty || "General Practitioner"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <FaMapMarkerAlt className="text-red-500 mr-1" />
                  <span>{doctor.location || "Location not specified"}</span>
                </div>
                
                {/* You'll need to add ratings to your database or use a separate table */}
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400 mr-1">
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar className="text-yellow-200" />
                  </div>
                  <span className="text-sm text-gray-600">4.0 (0 reviews)</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-gray-500 text-sm">Consultation Fee</span>
                    <p className="font-bold text-gray-900">${doctor.consultation_fee || "N/A"}</p>
                  </div>
                  
                  <div className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Available
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
        
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <nav className="flex items-center gap-2">
              <button
                className="px-3 py-1 border rounded-md disabled:opacity-50"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`px-3 py-1 border rounded-md ${
                    currentPage === page ? 'bg-blue-600 text-white' : ''
                  }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              
              <button
                className="px-3 py-1 border rounded-md disabled:opacity-50"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                disabled={currentPage === pagination.totalPages}
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </motion.div>
  );
} 