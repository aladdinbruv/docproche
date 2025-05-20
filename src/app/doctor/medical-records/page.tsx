"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClientComponentClient } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, FileText, Filter, Download, Eye, AlertCircle, RefreshCw, WifiOff } from 'lucide-react';
import { LoadingWithTimeout } from '@/components/LoadingWithTimeout';
import { isNetworkError, getUserFriendlyErrorMessage } from '@/utils/errorUtils';
import { useSearchParams } from 'next/navigation';
import { useNetworkStatus } from '@/components/NetworkStatusProvider';
import type { PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// Define interface for health record to match database schema
interface HealthRecord {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_id?: string;
  record_type: string;
  title: string;
  description?: string;
  file_url?: string;
  is_confidential?: boolean;
  created_at: string;
  updated_at?: string;
  last_accessed_at?: string;
  last_accessed_by?: string;
  patient?: {
    id: string;
    full_name: string;
    email?: string;
  };
  appointment?: {
    date: string;
    time_slot: string;
    consultation_type: string;
  };
}

// Extend the SupabaseClient type to include our custom RPC function
type SupabaseClientWithCustomRPC = SupabaseClient<Database> & {
  rpc(fn: 'get_doctor_health_records', params: { doctor_id_param: string }): ReturnType<SupabaseClient['rpc']>;
};

export default function DoctorMedicalRecordsPage() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [recordTypeFilter, setRecordTypeFilter] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const patientFilter = searchParams.get('patient');
  const { isOnline } = useNetworkStatus();
  
  // Fetch health records with enhanced error handling
  const fetchHealthRecords = useCallback(async () => {
    if (!user || !profile) return;
    
    setIsLoading(true);
    setError(null);
    const supabase = createClientComponentClient() as SupabaseClientWithCustomRPC;
    
    try {
      // Use the dedicated RPC function for doctor health records
      let healthRecordsQuery;
      
      if (patientFilter) {
        // If a patient filter is specified, use the standard query with filter
        healthRecordsQuery = supabase
          .from('health_records')
          .select(`
            *,
            patient:patient_id(id, full_name, email),
            appointment:appointment_id(date, time_slot, consultation_type)
          `)
          .eq('doctor_id', profile.id)
          .eq('patient_id', patientFilter)
          .order('created_at', { ascending: false });
      } else {
        // Otherwise use the RPC function
        healthRecordsQuery = supabase
          .rpc('get_doctor_health_records', { doctor_id_param: profile.id })
          .select(`
            *,
            patient:patient_id(id, full_name, email),
            appointment:appointment_id(date, time_slot, consultation_type)
          `);
      }
      
      // Execute query with timeout
      const fetchPromise = healthRecordsQuery;
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out')), 15000);
      });
      
      const result = await Promise.race([fetchPromise, timeoutPromise]) as PostgrestSingleResponse<HealthRecord[]>;
      
      if (result.error) {
        console.error('Error fetching health records:', result.error);
        if (isNetworkError(result.error)) {
          setError('Network error: Cannot connect to the server. Please check your internet connection.');
        } else {
          setError(`Failed to load medical records: ${result.error.message}`);
        }
      } else {
        setHealthRecords(result.data || []);
      }
      
    } catch (error) {
      console.error('Exception in fetchHealthRecords:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(getUserFriendlyErrorMessage(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [user, profile, patientFilter]);
  
  // Fetch records on component mount and when dependencies change
  useEffect(() => {
    fetchHealthRecords();
  }, [fetchHealthRecords]);

  // Filter records based on search query and record type
  const filteredRecords = healthRecords.filter(record => {
    // Apply search filter
    const matchesSearch = 
      record.patient?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.record_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply record type filter
    const matchesType = recordTypeFilter ? record.record_type === recordTypeFilter : true;
    
    return matchesSearch && matchesType;
  });

  // Get unique record types for filtering
  const recordTypes = Array.from(new Set(healthRecords.map(record => record.record_type)));

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  // Return page content wrapped in timeout handler
  return (
    <LoadingWithTimeout 
      isLoading={authLoading || isLoading}
      loadingMessage="Loading medical records..."
      onRefresh={fetchHealthRecords}
    >
      <div className="min-h-screen bg-gray-50 pb-12">
        {error && (
          <div className="container mx-auto px-4 py-2">
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  {!isOnline ? (
                    <WifiOff className="h-5 w-5 text-red-400" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
                <div className="ml-auto pl-3">
                  <Button variant="ghost" size="sm" onClick={fetchHealthRecords}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      
        <div className="bg-blue-600 text-white py-6">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl font-bold mb-2">Medical Records</h1>
            <p className="text-blue-100">
              {patientFilter 
                ? "Viewing records for a specific patient" 
                : "Manage and access patient medical history"}
            </p>
          </div>
        </div>
        
        <div className="container mx-auto px-4 mt-6">
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative col-span-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    className="pl-10"
                    placeholder="Search by patient name, record type, or title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div>
                  <select
                    className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={recordTypeFilter || ''}
                    onChange={(e) => setRecordTypeFilter(e.target.value || null)}
                  >
                    <option value="">All Record Types</option>
                    {recordTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Tabs defaultValue="all">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Records</TabsTrigger>
              <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
              <TabsTrigger value="lab-results">Lab Results</TabsTrigger>
              <TabsTrigger value="imaging">Imaging</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              {filteredRecords.length === 0 ? (
                <div className="text-center py-12">
                  {error ? (
                    <div>
                      <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
                      <h3 className="text-lg font-medium text-gray-800 mb-2">Couldn&apos;t load records</h3>
                      <p className="text-gray-500 max-w-md mx-auto mb-4">
                        {error}
                      </p>
                      <Button onClick={fetchHealthRecords}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Try Again
                      </Button>
                    </div>
                  ) : (
                    <>
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-medium text-gray-800 mb-2">No medical records found</h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        {searchQuery || recordTypeFilter ? "Try adjusting your search query." : "Start creating records for your patients."}
                      </p>
                      <Button className="mt-4">
                        Create New Record
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredRecords.map((record) => (
                    <Card key={record.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between">
                          <div>
                            <CardTitle>{record.title}</CardTitle>
                            <CardDescription>
                              Patient: {record.patient?.full_name || 'Unknown'} · Type: {record.record_type}
                            </CardDescription>
                          </div>
                          {record.is_confidential && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Confidential
                            </span>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-4">{record.description || 'No description provided'}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {record.appointment && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Appointment: {record.appointment.date}
                            </span>
                          )}
                          {record.file_url && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              File Attached
                            </span>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center mt-4">
                          <span className="text-xs text-gray-500">
                            Created: {formatDate(record.created_at)}
                            {record.last_accessed_at && ` · Last accessed: ${formatDate(record.last_accessed_at)}`}
                          </span>
                          <div className="flex gap-2">
                            {record.file_url && (
                              <a 
                                href={record.file_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md border border-gray-300 hover:bg-gray-100"
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </a>
                            )}
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3 mr-1" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="prescriptions">
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Prescription Records</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  This tab would show prescription records only.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="lab-results">
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Lab Results</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  This tab would show lab test results only.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="imaging">
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Imaging Records</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  This tab would show imaging studies and results.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </LoadingWithTimeout>
  );
}
