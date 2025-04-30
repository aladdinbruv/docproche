// src/app/my-appointments/page.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { MedicalCrossIcon } from "@/components/MedicalIcons";
import { AppointmentTimeline } from "@/components/AppointmentTimeline";

// Appointment status type
type AppointmentStatus = "upcoming" | "completed" | "cancelled" | "rescheduled";

// Appointment interface
interface Appointment {
  id: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorImage: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  location: string;
  type: "in-person" | "video";
  notes?: string;
}

export default function MyAppointmentsPage() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "cancelled">("upcoming");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  
  // Mock appointments data
  const appointments: Appointment[] = [
    {
      id: "apt1",
      doctorName: "Dr. Sarah Johnson",
      doctorSpecialty: "Cardiologist",
      doctorImage: "https://randomuser.me/api/portraits/women/76.jpg",
      date: "2023-10-12",
      time: "10:30 AM",
      status: "upcoming",
      location: "New York Medical Center, Room 305",
      type: "in-person"
    },
    {
      id: "apt2",
      doctorName: "Dr. Michael Williams",
      doctorSpecialty: "Dermatologist",
      doctorImage: "https://randomuser.me/api/portraits/men/32.jpg",
      date: "2023-10-20",
      time: "2:15 PM",
      status: "upcoming",
      location: "Manhattan Skin Clinic",
      type: "in-person",
      notes: "Please bring previous prescription and allergy test results"
    },
    {
      id: "apt3",
      doctorName: "Dr. Emily Roberts",
      doctorSpecialty: "Psychiatrist",
      doctorImage: "https://randomuser.me/api/portraits/women/45.jpg",
      date: "2023-11-05",
      time: "11:00 AM",
      status: "upcoming",
      location: "Online Video Consultation",
      type: "video"
    },
    {
      id: "apt4",
      doctorName: "Dr. James Anderson",
      doctorSpecialty: "Neurologist",
      doctorImage: "https://randomuser.me/api/portraits/men/67.jpg",
      date: "2023-08-17",
      time: "9:45 AM",
      status: "completed",
      location: "Neuroscience Institute, Floor 4",
      type: "in-person"
    },
    {
      id: "apt5",
      doctorName: "Dr. Rebecca Chen",
      doctorSpecialty: "Orthopedic Surgeon",
      doctorImage: "https://randomuser.me/api/portraits/women/23.jpg",
      date: "2023-09-10",
      time: "3:30 PM",
      status: "completed",
      location: "Orthopedic Specialists Center",
      type: "in-person"
    },
    {
      id: "apt6",
      doctorName: "Dr. David Thompson",
      doctorSpecialty: "Family Medicine",
      doctorImage: "https://randomuser.me/api/portraits/men/92.jpg",
      date: "2023-09-25",
      time: "10:00 AM",
      status: "cancelled",
      location: "Family Health Clinic",
      type: "in-person"
    }
  ];
  
  // Filter appointments based on active tab
  const filteredAppointments = appointments.filter(appointment => {
    if (activeTab === "upcoming") return appointment.status === "upcoming" || appointment.status === "rescheduled";
    if (activeTab === "past") return appointment.status === "completed";
    return appointment.status === "cancelled";
  });
  
  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };
  
  const closeAppointmentDetail = () => {
    setSelectedAppointment(null);
  };
  
  // Count appointments by status
  const upcomingCount = appointments.filter(apt => apt.status === "upcoming" || apt.status === "rescheduled").length;
  const completedCount = appointments.filter(apt => apt.status === "completed").length;
  const cancelledCount = appointments.filter(apt => apt.status === "cancelled").length;
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 py-12 md:py-16">
        <div className="container max-w-6xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center text-white"
          >
            <div className="flex justify-center mb-4">
              <MedicalCrossIcon className="w-10 h-10" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">My Appointments</h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Manage your scheduled appointments with healthcare providers
            </p>
          </motion.div>
        </div>
      </div>
      
      {/* Appointment Timeline */}
      <div className="container max-w-6xl mx-auto px-4 -mt-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Upcoming Appointments Timeline</h2>
          <AppointmentTimeline 
            appointments={appointments.filter(apt => apt.status === "upcoming").map(apt => ({
              id: apt.id,
              title: apt.doctorName,
              subtitle: apt.doctorSpecialty,
              date: apt.date,
              time: apt.time,
              status: "scheduled",
              description: apt.notes || `Appointment with ${apt.doctorName}`,
              doctorName: apt.doctorName,
              specialty: apt.doctorSpecialty
            }))}
          />
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">My Appointments</h2>
            <Link 
              href="/doctors" 
              className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Book New Appointment
            </Link>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <div className="text-center">
              <span className="block text-2xl font-bold text-blue-600">{upcomingCount}</span>
              <span className="text-sm text-gray-500">Upcoming</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-bold text-green-600">{completedCount}</span>
              <span className="text-sm text-gray-500">Completed</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-bold text-red-600">{cancelledCount}</span>
              <span className="text-sm text-gray-500">Cancelled</span>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex flex-wrap -mb-px">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`mr-6 py-4 px-1 font-medium text-sm border-b-2 ${
                activeTab === "upcoming"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Upcoming ({upcomingCount})
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`mr-6 py-4 px-1 font-medium text-sm border-b-2 ${
                activeTab === "past"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Past ({completedCount})
            </button>
            <button
              onClick={() => setActiveTab("cancelled")}
              className={`mr-6 py-4 px-1 font-medium text-sm border-b-2 ${
                activeTab === "cancelled"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Cancelled ({cancelledCount})
            </button>
          </nav>
        </div>
        
        {/* Appointment List or Detail */}
        <div className="bg-white rounded-xl shadow-md p-6">
          {selectedAppointment ? (
            <AppointmentDetail 
              appointment={selectedAppointment} 
              onClose={closeAppointmentDetail} 
            />
          ) : (
            <>
              {filteredAppointments.length > 0 ? (
                <div className="space-y-4">
                  {filteredAppointments.map((appointment) => (
                    <AppointmentCard 
                      key={appointment.id}
                      appointment={appointment}
                      onClick={() => handleAppointmentClick(appointment)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-xl font-semibold mb-2 text-gray-700">No {activeTab} appointments</h3>
                  <p className="text-gray-500">
                    {activeTab === "upcoming" 
                      ? "You don't have any upcoming appointments scheduled"
                      : activeTab === "past"
                      ? "You don't have any past appointment records"
                      : "You don't have any cancelled appointments"
                    }
                  </p>
                  {activeTab === "upcoming" && (
                    <Link
                      href="/doctors"
                      className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Find a Doctor
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Health Tips Section */}
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
          <h2 className="text-xl font-bold mb-4 text-blue-800">Healthcare Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-medium text-blue-600 mb-2">Before Your Appointment</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-green-500 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Prepare a list of questions for your doctor
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-green-500 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Bring a list of your current medications
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-green-500 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Arrive 15 minutes early for in-person visits
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-medium text-blue-600 mb-2">For Video Consultations</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-green-500 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Test your camera and microphone in advance
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-green-500 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Ensure you have a stable internet connection
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-green-500 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Find a quiet, well-lit space for your call
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-medium text-blue-600 mb-2">Appointment Policies</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-green-500 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Cancel at least 24 hours in advance to avoid fees
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-green-500 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  You can reschedule up to 3 times per appointment
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-green-500 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Insurance verification is done 48 hours before visit
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Appointment Card Component
function AppointmentCard({ appointment, onClick }: { appointment: Appointment; onClick: () => void }) {
  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Status badge color
  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case "upcoming": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "rescheduled": return "bg-amber-100 text-amber-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  return (
    <div 
      onClick={onClick}
      className="relative flex flex-col md:flex-row border border-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Left Column - Doctor Info */}
      <div className="flex items-center p-4 md:w-1/3 border-r border-gray-100">
        <div className="flex-shrink-0 mr-4">
          <img 
            src={appointment.doctorImage} 
            alt={appointment.doctorName}
            className="w-14 h-14 rounded-full object-cover"
          />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{appointment.doctorName}</h3>
          <p className="text-sm text-gray-500">{appointment.doctorSpecialty}</p>
        </div>
      </div>
      
      {/* Middle Column - Appointment Details */}
      <div className="flex-1 p-4 border-t md:border-t-0 md:border-r border-gray-100">
        <div className="flex items-start">
          <div className="mr-4">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{formatDate(appointment.date)}</p>
            <p className="text-sm text-gray-500">{appointment.time}</p>
          </div>
        </div>
        
        <div className="flex items-start mt-3">
          <div className="mr-4">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500">{appointment.location}</p>
            <p className="text-xs text-gray-400 mt-1">
              {appointment.type === "in-person" ? "In-person Visit" : "Video Consultation"}
            </p>
          </div>
        </div>
      </div>
      
      {/* Right Column - Status */}
      <div className="p-4 md:w-1/5 flex flex-row md:flex-col justify-between md:justify-center items-end">
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
        </span>
        
        {appointment.status === "upcoming" && (
          <button className="text-blue-600 text-sm hover:underline">
            Manage
          </button>
        )}
      </div>
    </div>
  );
}

// Appointment Detail Component
function AppointmentDetail({ appointment, onClose }: { appointment: Appointment; onClose: () => void }) {
  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Status badge color
  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case "upcoming": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "rescheduled": return "bg-amber-100 text-amber-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  const isUpcoming = appointment.status === "upcoming" || appointment.status === "rescheduled";
  
  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Appointment Details</h2>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Appointment Info Card */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <img 
              src={appointment.doctorImage} 
              alt={appointment.doctorName}
              className="w-16 h-16 rounded-full object-cover mr-4"
            />
            <div>
              <h3 className="text-lg font-medium text-gray-900">{appointment.doctorName}</h3>
              <p className="text-gray-500">{appointment.doctorSpecialty}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
          </span>
        </div>
        
        <div className="space-y-4">
          <div className="flex">
            <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-700">Date & Time</p>
              <p className="text-gray-600">{formatDate(appointment.date)} at {appointment.time}</p>
            </div>
          </div>
          
          <div className="flex">
            <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-700">Location</p>
              <p className="text-gray-600">{appointment.location}</p>
              <p className="text-sm text-gray-500 mt-1">
                {appointment.type === "in-person" ? "In-person Visit" : "Video Consultation"}
              </p>
            </div>
          </div>
          
          {appointment.notes && (
            <div className="flex">
              <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-700">Notes</p>
                <p className="text-gray-600">{appointment.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Actions */}
      {isUpcoming && (
        <div className="flex gap-4">
          <button className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">
            Reschedule Appointment
          </button>
          <button className="flex-1 border border-red-500 text-red-500 py-2 rounded-md hover:bg-red-50 transition-colors">
            Cancel Appointment
          </button>
        </div>
      )}
      
      {appointment.status === "completed" && (
        <div className="flex gap-4">
          <button className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">
            View Medical Record
          </button>
          <button className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-50 transition-colors">
            Book Follow-up
          </button>
        </div>
      )}
    </div>
  );
}


