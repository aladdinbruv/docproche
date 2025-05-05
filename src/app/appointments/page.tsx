// src/app/my-appointments/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { MedicalCrossIcon } from "@/components/MedicalIcons";
import { AppointmentsList } from "@/components/AppointmentsList";
import { createClientComponentClient } from "@/lib/supabase";

export default function MyAppointmentsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userType, setUserType] = useState<'patient' | 'doctor'>('patient');
  const [loading, setLoading] = useState(true);
  
  const supabase = createClientComponentClient();
  
  // Fetch the current user's ID and role on page load
  useEffect(() => {
    async function fetchUserInfo() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user?.id) {
        setUserId(session.user.id);
        
        // Get user role
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (userData?.role === 'doctor') {
          setUserType('doctor');
        }
      }
      
      setLoading(false);
    }
    
    fetchUserInfo();
  }, [supabase]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
    </div>
  );
}

  if (!userId) {
  return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
        <p className="mb-6 text-center">Please sign in to view your appointments</p>
        <Link 
          href="/auth/signin" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
        >
          Sign In
        </Link>
    </div>
  );
}
  
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center mb-8">
          <MedicalCrossIcon className="w-10 h-10 text-blue-500 mr-4" />
          <h1 className="text-3xl font-bold text-gray-900">
            {userType === 'patient' ? 'My Appointments' : 'Patient Appointments'}
          </h1>
      </div>
      
        <div className="bg-white rounded-xl shadow-md p-6">
          <AppointmentsList 
            userId={userId} 
            userType={userType} 
            includeUser={true} 
          />
        </div>
        
        {userType === 'patient' && (
          <div className="mt-8 text-center">
            <Link 
              href="/doctors"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
            >
              Book New Appointment
            </Link>
            </div>
          )}
      </motion.div>
    </div>
  );
}


