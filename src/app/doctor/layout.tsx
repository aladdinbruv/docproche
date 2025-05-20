import React from "react";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  FileText, 
  Activity, 
  Settings, 
  LogOut,
  Clock,
  MessageSquare,
  Stethoscope,
  Receipt,
  PieChart
} from "lucide-react";

import { getCurrentUser } from "@/lib/server-auth";
import { getServerComponentClient } from "@/lib/server-supabase";
import { redirect } from "next/navigation";
import { DoctorClient } from "@/components";

export const metadata = {
  title: "Doctor Portal | DocToProche",
  description: "Manage your patients, appointments, and medical practice efficiently.",
};

async function getDoctorProfile() {
  try {
    // Use the helper function to get a Supabase client with proper cookie handling
    const supabase = getServerComponentClient();
    
    // Get the current user
    const user = await getCurrentUser();
    
    if (!user) {
      console.log('No user found in doctor layout');
      return { isDoctor: false };
    }
    
    // Fetch profile using the Supabase client
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) {
      console.error('Error fetching doctor profile:', error.message);
      return { isDoctor: false };
    }
    
    return {
      isDoctor: profile?.role === 'doctor',
      profile
    };
  } catch (err) {
    console.error('Exception in getDoctorProfile:', err);
    return { isDoctor: false };
  }
}

export default async function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isDoctor, profile } = await getDoctorProfile();
  
  // Only redirect if we're certain the user is not a doctor
  if (isDoctor === false) {
    console.log('User is not a doctor, redirecting to login');
    // Add a query parameter to prevent redirect loops
    return redirect('/auth/login?redirectTo=/doctor&reason=doctor_access_required');
  }
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b">
          <Link href="/doctor" className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-blue-600" />
            <span className="font-bold text-xl">Doctor Portal</span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/doctor" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-blue-50 text-gray-700 hover:text-blue-700 font-medium transition-colors">
            <LayoutDashboard className="h-5 w-5 text-gray-500" />
            <span>Dashboard</span>
          </Link>
          
          <Link href="/doctor/appointments" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-blue-50 text-gray-700 hover:text-blue-700 font-medium transition-colors">
            <CalendarDays className="h-5 w-5 text-gray-500" />
            <span>Appointments</span>
          </Link>
          
          <Link href="/doctor/patients" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-blue-50 text-gray-700 hover:text-blue-700 font-medium transition-colors">
            <Users className="h-5 w-5 text-gray-500" />
            <span>Patients</span>
          </Link>
          
          <Link href="/doctor/consultations" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-blue-50 text-gray-700 hover:text-blue-700 font-medium transition-colors">
            <MessageSquare className="h-5 w-5 text-gray-500" />
            <span>Consultations</span>
          </Link>
          
          <Link href="/doctor/schedule" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-blue-50 text-gray-700 hover:text-blue-700 font-medium transition-colors">
            <Clock className="h-5 w-5 text-gray-500" />
            <span>Schedule</span>
          </Link>
          
          <Link href="/doctor/prescriptions" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-blue-50 text-gray-700 hover:text-blue-700 font-medium transition-colors">
            <FileText className="h-5 w-5 text-gray-500" />
            <span>Prescriptions</span>
          </Link>
          
          <Link href="/doctor/medical-records" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-blue-50 text-gray-700 hover:text-blue-700 font-medium transition-colors">
            <Activity className="h-5 w-5 text-gray-500" />
            <span>Medical Records</span>
          </Link>
          
          <Link href="/doctor/billing" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-blue-50 text-gray-700 hover:text-blue-700 font-medium transition-colors">
            <Receipt className="h-5 w-5 text-gray-500" />
            <span>Billing</span>
          </Link>
          
          <Link href="/doctor/analytics" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-blue-50 text-gray-700 hover:text-blue-700 font-medium transition-colors">
            <PieChart className="h-5 w-5 text-gray-500" />
            <span>Analytics</span>
          </Link>
        </nav>
        
        <div className="p-4 border-t mt-auto space-y-1">
          <Link href="/doctor/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-blue-50 text-gray-700 hover:text-blue-700 font-medium transition-colors">
            <Settings className="h-5 w-5 text-gray-500" />
            <span>Profile</span>
          </Link>
          
          <form action="/api/auth/signout" method="post">
            <button type="submit" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-red-50 text-gray-700 hover:text-red-700 font-medium transition-colors">
              <LogOut className="h-5 w-5 text-gray-500" />
              <span>Logout</span>
            </button>
          </form>
        </div>
      </div>
      
      {/* Client-side mobile navigation */}
      <DoctorClient />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}