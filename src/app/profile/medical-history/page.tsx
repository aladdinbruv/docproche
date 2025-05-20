"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { motion } from "framer-motion";
import {
  FileText,
  ArrowLeft,
  Calendar,
  AlertCircle,
  Plus,
  ChevronRight
} from "lucide-react";
import { FaNotesMedical, FaFileMedical, FaPrescriptionBottle } from "react-icons/fa";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingWithTimeout } from "@/components/LoadingWithTimeout";
import type { MedicalHistory, HealthRecord, Prescription } from "@/types/supabase";

export default function MedicalHistoryPage() {
  const router = useRouter();
  const { user, profile, isLoading: authLoading } = useAuth();
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClientComponentClient();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirectTo=/profile/medical-history');
    }
  }, [user, authLoading, router]);

  // Fetch medical data
  useEffect(() => {
    if (user && profile?.role === 'patient') {
      fetchMedicalData();
    }
  }, [user, profile]);

  const fetchMedicalData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch medical history
      const { data: historyData, error: historyError } = await supabase
        .from('medical_history')
        .select('*')
        .eq('patient_id', profile?.id || user?.id || '')
        .order('created_at', { ascending: false });
      
      if (historyError) throw historyError;
      setMedicalHistory(historyData || []);
      
      // Fetch health records
      const { data: recordsData, error: recordsError } = await supabase
        .from('health_records')
        .select('*')
        .eq('patient_id', profile?.id || user?.id || '')
        .order('created_at', { ascending: false });
      
      if (recordsError) throw recordsError;
      setHealthRecords(recordsData || []);
      
      // Fetch prescriptions
      const { data: prescriptionsData, error: prescriptionsError } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('patient_id', profile?.id || user?.id || '')
        .order('created_at', { ascending: false });
      
      if (prescriptionsError) throw prescriptionsError;
      setPrescriptions(prescriptionsData || []);
    } catch (error: any) {
      console.error('Error fetching medical data:', error);
      setError(error.message || "Failed to load medical history");
    } finally {
      setIsLoading(false);
    }
  };

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (authLoading || isLoading) {
    return <LoadingWithTimeout isLoading={true} loadingMessage="Loading your medical history..." />;
  }
  
  if (!user && !profile) {
    return null; // Redirect is handled by useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-blue-600 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Medical History</h1>
              <p className="text-blue-100">View your health records and medical history</p>
            </div>
            <Button 
              variant="outline" 
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              onClick={() => router.push('/profile')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 mt-6">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Health Summary Card */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-xl">Health Overview</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-600 text-sm font-medium">Health Records</p>
                        <h3 className="text-2xl font-bold mt-1">{healthRecords.length}</h3>
                      </div>
                      <div className="bg-blue-100 p-3 rounded-full">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-600 text-sm font-medium">Active Prescriptions</p>
                        <h3 className="text-2xl font-bold mt-1">
                          {prescriptions.filter(p => p.is_active).length}
                        </h3>
                      </div>
                      <div className="bg-green-100 p-3 rounded-full">
                        <FaPrescriptionBottle className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-600 text-sm font-medium">Medical Conditions</p>
                        <h3 className="text-2xl font-bold mt-1">
                          {medicalHistory.filter(m => m.is_current).length}
                        </h3>
                      </div>
                      <div className="bg-purple-100 p-3 rounded-full">
                        <FaNotesMedical className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Health Records */}
          <div>
            <Card>
              <CardHeader className="pb-4 border-b flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Health Records</CardTitle>
                <Button variant="outline" size="sm" onClick={() => router.push('/health-records')}>
                  <Plus className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {healthRecords.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <FileText className="h-12 w-12 text-gray-300 mb-2" />
                    <h3 className="text-lg font-medium text-gray-800 mb-1">No health records found</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      Your health records will appear here after your appointments.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {healthRecords.slice(0, 5).map((record) => (
                      <div key={record.id} className="p-4 hover:bg-gray-50">
                        <div className="flex justify-between">
                          <div>
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 mb-2">
                              {record.record_type}
                            </span>
                            <h4 className="font-medium">{record.title}</h4>
                            <p className="text-sm text-gray-500 mt-1">
                              {formatDate(record.created_at)}
                            </p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-blue-600"
                            onClick={() => router.push(`/health-records/${record.id}`)}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Prescriptions */}
          <div>
            <Card>
              <CardHeader className="pb-4 border-b flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Prescriptions</CardTitle>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {prescriptions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <FaPrescriptionBottle className="h-12 w-12 text-gray-300 mb-2" />
                    <h3 className="text-lg font-medium text-gray-800 mb-1">No prescriptions found</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      Your prescriptions will appear here when your doctor issues them.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {prescriptions.slice(0, 5).map((prescription) => (
                      <div key={prescription.id} className="p-4 hover:bg-gray-50">
                        <div className="flex justify-between">
                          <div>
                            <h4 className="font-medium">Prescription {prescription.id.substring(0, 8)}</h4>
                            <p className="text-sm text-gray-500 mt-1">
                              Issued: {formatDate(prescription.issue_date)}
                            </p>
                            <div className="mt-2">
                              <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                                prescription.is_active 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {prescription.is_active ? 'Active' : 'Expired'}
                              </span>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-blue-600"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Medical History */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-xl">Medical Conditions & History</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {medicalHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <FaNotesMedical className="h-12 w-12 text-gray-300 mb-2" />
                    <h3 className="text-lg font-medium text-gray-800 mb-1">No medical history found</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      Your medical conditions and history will be recorded here by your healthcare providers.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {medicalHistory.map((item) => (
                      <div key={item.id} className="p-4 hover:bg-gray-50">
                        <div>
                          <div className="flex items-center mb-1">
                            <span className={`inline-flex items-center px-2 py-1 mr-2 text-xs font-medium rounded-full ${
                              item.is_current 
                                ? 'bg-amber-100 text-amber-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {item.is_current ? 'Current' : 'Past'}
                            </span>
                            <h4 className="font-medium">{item.history_type}</h4>
                          </div>
                          
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                          
                          {item.diagnosed_date && (
                            <div className="flex items-center mt-2 text-xs text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              Diagnosed: {formatDate(item.diagnosed_date)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 