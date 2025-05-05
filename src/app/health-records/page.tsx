// src/app/health-records/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MedicalCrossIcon } from "@/components/MedicalIcons";
import { HealthStatCard } from "@/components/HealthStatCard";
import { HealthRecordsList } from "@/components/HealthRecordsList";
import { createClientComponentClient } from "@/lib/supabase";
import Link from "next/link";

export default function HealthRecordsPage() {
  const [activeTab, setActiveTab] = useState<"records" | "vitals" | "medications" | "documents">("records");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClientComponentClient();
  
  // Fetch the current user's ID on page load
  useEffect(() => {
    async function fetchUserId() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user?.id) {
        setUserId(session.user.id);
      }
      
      setLoading(false);
    }
    
    fetchUserId();
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
        <p className="mb-6 text-center">Please sign in to view your health records</p>
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
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Your Health Records</h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Securely access and manage your complete medical history, prescriptions, and lab results.
            </p>
          </motion.div>
        </div>
      </div>
      
      {/* Health Stats Cards - We'll keep these for now */}
      <div className="container max-w-6xl mx-auto px-4 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <HealthStatCard 
            title="Active Medications"
            value="View"
            subtitle="Manage your prescriptions"
            icon="pills"
            trend="neutral"
          />
          <HealthStatCard 
            title="Medical History"
            value="View"
            subtitle="Your health timeline"
            icon="file-medical"
            trend="neutral"
          />
          <HealthStatCard 
            title="Secure Records"
            value="Protected"
            subtitle="End-to-end encrypted"
            icon="shield-check"
            trend="positive"
          />
        </div>
      </div>
      
      {/* Main Content Area - Replace with HealthRecordsList */}
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white shadow-md rounded-xl p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Your Health Information</h2>
            <p className="text-gray-600">
              All your health data is securely stored and only accessible to you and authorized healthcare providers.
            </p>
          </div>
          
          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("records")}
                className={`py-2 font-medium text-sm border-b-2 ${
                activeTab === "records"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
                Health Records
            </button>
            <button
              onClick={() => setActiveTab("vitals")}
                className={`py-2 font-medium text-sm border-b-2 ${
                activeTab === "vitals"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Vital Statistics
            </button>
            <button
              onClick={() => setActiveTab("medications")}
                className={`py-2 font-medium text-sm border-b-2 ${
                activeTab === "medications"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Medications
            </button>
            <button
              onClick={() => setActiveTab("documents")}
                className={`py-2 font-medium text-sm border-b-2 ${
                activeTab === "documents"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
                Documents
                      </button>
                    </div>
                  </div>
                  
          {/* Tab Content */}
          <div className="mb-8">
            {activeTab === "records" && (
              <div>
                <HealthRecordsList patientId={userId} />
            </div>
          )}
          
          {activeTab === "vitals" && (
            <div>
                <p className="text-gray-600 mb-4">
                  Track your vital signs over time to monitor your health status.
                </p>
                <p className="text-center py-8 text-gray-500">
                  Vital statistics tracking feature coming soon.
                </p>
            </div>
          )}
          
          {activeTab === "medications" && (
            <div>
                <p className="text-gray-600 mb-4">
                  Set up medication reminders to help you stay on track with your prescriptions.
                </p>
                <p className="text-center py-8 text-gray-500">
                  Medication reminder feature coming soon.
                </p>
            </div>
          )}
          
          {activeTab === "documents" && (
            <div>
                <p className="text-gray-600 mb-4">
                  Securely store and access your medical documents and lab results.
                </p>
                <p className="text-center py-8 text-gray-500">
                  Document repository feature coming soon.
                </p>
            </div>
          )}
      </div>
      
          {/* Security Notice */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <h3 className="font-semibold text-blue-800 mb-2">Your Privacy Matters</h3>
            <p className="text-blue-700 text-sm">
              Your health records are protected with end-to-end encryption and strict access controls.
              Only you and the healthcare providers you authorize can access your information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

