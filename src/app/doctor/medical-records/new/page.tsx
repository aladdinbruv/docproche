"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@/hooks/useAuth';
import { useHealthRecords } from '@/hooks/useHealthRecords';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { LoadingWithTimeout } from '@/components/LoadingWithTimeout';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

export default function NewMedicalRecordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patient');
  const { user, profile, isLoading: authLoading } = useAuth();
  const { createHealthRecord, isLoading: createLoading } = useHealthRecords();
  
  const [title, setTitle] = useState('');
  const [recordType, setRecordType] = useState('General');
  const [description, setDescription] = useState('');
  const [isConfidential, setIsConfidential] = useState(false);
  const [patientDetails, setPatientDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const supabase = createClientComponentClient();
  
  // Handle redirect if not authenticated or not a doctor
  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== 'doctor')) {
      router.push('/auth/login?redirectTo=/doctor/medical-records/new');
      return;
    }
    
    // If no patient ID is provided, redirect to the medical records list
    if (!patientId && !authLoading) {
      router.push('/doctor/medical-records');
      return;
    }
    
    // If we have a patient ID, fetch patient details
    if (patientId && user) {
      fetchPatientDetails();
    }
  }, [user, profile, authLoading, patientId, router]);
  
  // Fetch patient details
  const fetchPatientDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email, phone_number')
        .eq('id', patientId)
        .eq('role', 'patient')
        .single();
        
      if (error) throw error;
      setPatientDetails(data);
    } catch (error) {
      console.error('Error fetching patient details:', error);
      setError('Could not load patient information. Please try again.');
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Please enter a title for the health record.');
      return;
    }
    
    if (!recordType.trim()) {
      setError('Please select a record type.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Create the health record
      const result = await createHealthRecord({
        patient_id: patientId!,
        record_type: recordType,
        title: title,
        description: description,
        is_confidential: isConfidential,
      });
      
      if (result?.error) {
        throw new Error(result.error);
      }
      
      // Redirect to the record detail page or back to patient records
      router.push(`/doctor/medical-records?patient=${patientId}`);
    } catch (error: any) {
      console.error('Error creating health record:', error);
      setError(error.message || 'Failed to create health record. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <LoadingWithTimeout isLoading={authLoading} loadingMessage="Loading patient information...">
      <div className="min-h-screen bg-gray-50 pb-12">
        <div className="bg-blue-600 text-white py-6">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Add Medical Record</h1>
              <Button
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Patient Information */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Patient Information</CardTitle>
                </CardHeader>
                <CardContent>
                  {patientDetails ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-500">Name</label>
                        <p className="font-medium">{patientDetails.full_name}</p>
                      </div>
                      
                      {patientDetails.email && (
                        <div>
                          <label className="text-sm text-gray-500">Email</label>
                          <p>{patientDetails.email}</p>
                        </div>
                      )}
                      
                      {patientDetails.phone_number && (
                        <div>
                          <label className="text-sm text-gray-500">Phone</label>
                          <p>{patientDetails.phone_number}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500">Loading patient information...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Record Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Medical Record Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                      <div className="flex">
                        <AlertCircle className="h-5 w-5 text-red-400" />
                        <p className="ml-3 text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Record Title</Label>
                        <Input
                          id="title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Enter record title"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="recordType">Record Type</Label>
                        <select
                          id="recordType"
                          value={recordType}
                          onChange={(e) => setRecordType(e.target.value)}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          required
                        >
                          <option value="General">General</option>
                          <option value="Diagnosis">Diagnosis</option>
                          <option value="Lab Results">Lab Results</option>
                          <option value="Prescription">Prescription</option>
                          <option value="Consultation">Consultation</option>
                          <option value="Imaging">Imaging</option>
                          <option value="Surgery">Surgery</option>
                          <option value="Follow-up">Follow-up</option>
                        </select>
                      </div>
                      
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Enter record details"
                          className="min-h-[200px]"
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="confidential"
                          checked={isConfidential}
                          onChange={(e) => setIsConfidential(e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <Label htmlFor="confidential">Mark as confidential</Label>
                      </div>
                      
                      <div className="pt-4 flex justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          className="mr-2"
                          onClick={() => router.back()}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting || createLoading}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {isSubmitting ? 'Saving...' : 'Save Record'}
                        </Button>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </LoadingWithTimeout>
  );
} 