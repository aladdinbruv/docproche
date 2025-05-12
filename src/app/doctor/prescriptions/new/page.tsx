"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import PrescriptionForm from '@/components/PrescriptionForm';
import { ArrowLeft, Check } from 'lucide-react';
import Link from 'next/link';

export default function NewPrescriptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, isLoading: authLoading } = useAuth();
  const [success, setSuccess] = useState(false);
  
  // Get URL parameters (for patient_id and appointment_id if coming from appointment page)
  const patientId = searchParams.get('patient_id');
  const appointmentId = searchParams.get('appointment_id');

  // Handle successful prescription creation
  const handleSuccess = (prescriptionId: string) => {
    setSuccess(true);
    
    // Redirect after a short delay to show success message
    setTimeout(() => {
      router.push('/doctor/prescriptions');
    }, 1500);
  };

  // Handle cancel button
  const handleCancel = () => {
    router.back();
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-600 border-b-blue-100 border-l-blue-100 border-r-blue-100 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Authentication check
  if (!user || !profile || profile.role !== 'doctor') {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-100 text-red-600 p-4 rounded-md mb-4">
            <p className="font-medium">Access Denied</p>
            <p className="text-sm mt-1">Only doctors can create prescriptions</p>
          </div>
          <Link 
            href="/dashboard" 
            className="text-blue-600 hover:underline flex items-center justify-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-blue-600 text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-2">New Prescription</h1>
          <p className="text-blue-100">Create a prescription for your patient</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 mt-6">
        <div className="mb-4">
          <Link 
            href="/doctor/prescriptions" 
            className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Prescriptions
          </Link>
        </div>
        
        {success ? (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md flex items-center gap-3">
            <div className="bg-green-100 rounded-full p-2">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium">Prescription Created Successfully</h3>
              <p className="text-sm mt-1">Redirecting to prescriptions list...</p>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <PrescriptionForm 
              onSuccess={handleSuccess}
              onCancel={handleCancel}
              patientId={patientId || undefined}
              appointmentId={appointmentId || undefined}
            />
          </div>
        )}
      </div>
    </div>
  );
} 