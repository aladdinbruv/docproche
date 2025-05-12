"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClientComponentClient } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, Filter, Download, Plus, Calendar, Clock, User, 
  FileText, Trash, Edit, RefreshCw, CheckCircle, X 
} from 'lucide-react';
import { format, parseISO, isAfter } from 'date-fns';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Medication interface matching the JSONB structure in the database
interface Medication {
  name: string;
  dosage: string;
  frequency: string;
}

// Prescription interface matching database schema
interface Prescription {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_id?: string;
  medications: Medication[];
  instructions?: string;
  issue_date: string;
  expiry_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
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
  doctor?: {
    id: string;
    full_name: string;
  };
}

export default function DoctorPrescriptionsPage() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [allPrescriptions, setAllPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [showNewPrescriptionModal, setShowNewPrescriptionModal] = useState(false);
  const router = useRouter();
  
  // Fetch prescriptions
  useEffect(() => {
    const fetchPrescriptions = async () => {
      if (!user || !profile) return;
      
      setIsLoading(true);
      const supabase = createClientComponentClient();
      
      try {
        // Fetch all prescriptions for this doctor with related data
        const { data, error } = await supabase
          .from('prescriptions')
          .select(`
            *,
            patient:patient_id(id, full_name, email),
            appointment:appointment_id(date, time_slot, consultation_type)
          `)
          .eq('doctor_id', profile.id)
          .order('issue_date', { ascending: false });
          
        if (error) throw error;
        setAllPrescriptions(data || []);
        setPrescriptions(data || []);
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPrescriptions();
  }, [user, profile]);
  
  // Filter prescriptions based on filters
  useEffect(() => {
    let filteredPrescriptions = [...allPrescriptions];
    
    // Apply search filter
    if (searchQuery) {
      filteredPrescriptions = filteredPrescriptions.filter(prescription => 
        prescription.patient?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prescription.medications.some(med => med.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        prescription.instructions?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      if (statusFilter === 'active') {
        filteredPrescriptions = filteredPrescriptions.filter(
          prescription => prescription.is_active && !isPrescriptionExpired(prescription)
        );
      } else if (statusFilter === 'expired') {
        filteredPrescriptions = filteredPrescriptions.filter(
          prescription => isPrescriptionExpired(prescription)
        );
      } else if (statusFilter === 'inactive') {
        filteredPrescriptions = filteredPrescriptions.filter(
          prescription => !prescription.is_active
        );
      }
    }
    
    setPrescriptions(filteredPrescriptions);
  }, [searchQuery, statusFilter, allPrescriptions]);
  
  // Check if a prescription is expired
  const isPrescriptionExpired = (prescription: Prescription) => {
    if (!prescription.expiry_date) return false;
    return !isAfter(new Date(prescription.expiry_date), new Date());
  };

  // Calculate prescription statistics
  const calculateStats = () => {
    const totalPrescriptions = allPrescriptions.length;
    
    const activePrescriptions = allPrescriptions.filter(
      prescription => prescription.is_active && !isPrescriptionExpired(prescription)
    ).length;
    
    const expiredPrescriptions = allPrescriptions.filter(
      prescription => isPrescriptionExpired(prescription)
    ).length;
    
    const inactivePrescriptions = allPrescriptions.filter(
      prescription => !prescription.is_active
    ).length;
    
    return {
      totalPrescriptions,
      activePrescriptions,
      expiredPrescriptions,
      inactivePrescriptions
    };
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-600 border-b-blue-100 border-l-blue-100 border-r-blue-100 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading prescriptions...</p>
        </div>
      </div>
    );
  }

  // Get the statistics
  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-blue-600 text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-2">Prescriptions</h1>
          <p className="text-blue-100">Manage your patients' prescriptions</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 mt-6">
        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Prescriptions</p>
                  <h3 className="text-3xl font-bold mt-2">{stats.totalPrescriptions}</h3>
                </div>
                <div className="p-3 rounded-full bg-gray-100 text-gray-600">
                  <FileText className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Active</p>
                  <h3 className="text-3xl font-bold mt-2">{stats.activePrescriptions}</h3>
                </div>
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <CheckCircle className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Expired</p>
                  <h3 className="text-3xl font-bold mt-2">{stats.expiredPrescriptions}</h3>
                </div>
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Inactive</p>
                  <h3 className="text-3xl font-bold mt-2">{stats.inactivePrescriptions}</h3>
                </div>
                <div className="p-3 rounded-full bg-red-100 text-red-600">
                  <Trash className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  className="pl-10"
                  placeholder="Search by patient name or medication..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div>
                <select
                  className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={statusFilter || ''}
                  onChange={(e) => setStatusFilter(e.target.value || null)}
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => router.push('/doctor/prescriptions/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Prescription
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Prescriptions List */}
        <Card>
          <CardHeader>
            <CardTitle>Prescriptions</CardTitle>
            <CardDescription>
              View and manage all prescriptions you've issued
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {prescriptions.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">No prescriptions found</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  {searchQuery || statusFilter
                    ? "No prescriptions match your current filters. Try adjusting your search criteria."
                    : "You haven't created any prescriptions yet."}
                </p>
                <Button className="mt-4" onClick={() => router.push('/doctor/prescriptions/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Prescription
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {prescriptions.map((prescription) => {
                  const isExpired = isPrescriptionExpired(prescription);
                  const status = isExpired ? 'expired' : prescription.is_active ? 'active' : 'inactive';
                  
                  return (
                    <Card key={prescription.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className={`h-2 ${
                        status === 'active' ? 'bg-green-500' : 
                        status === 'expired' ? 'bg-yellow-500' : 
                        'bg-red-500'
                      }`}></div>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{prescription.patient?.full_name || 'Unknown Patient'}</h3>
                            <p className="text-sm text-gray-500">
                              Issued: {formatDate(prescription.issue_date)}
                            </p>
                          </div>
                          <span className={`text-xs px-2.5 py-1 rounded-full ${
                            status === 'active' ? 'bg-green-100 text-green-800' : 
                            status === 'expired' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </div>
                        
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Medications:</h4>
                          <ul className="text-sm">
                            {prescription.medications.map((med, index) => (
                              <li key={index} className="mb-1">
                                <span className="font-semibold">{med.name}</span> - {med.dosage}, {med.frequency}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        {prescription.instructions && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Instructions:</h4>
                            <p className="text-sm text-gray-600">{prescription.instructions}</p>
                          </div>
                        )}
                        
                        {prescription.appointment && (
                          <div className="mb-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              From appointment on: {prescription.appointment.date}, {prescription.appointment.time_slot}
                            </span>
                          </div>
                        )}
                        
                        {prescription.expiry_date && (
                          <div className="text-xs text-gray-500 mb-4">
                            Expires: {formatDate(prescription.expiry_date)}
                          </div>
                        )}
                        
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50">
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Renew
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <Trash className="h-3 w-3 mr-1" />
                            {prescription.is_active ? "Deactivate" : "Delete"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Placeholder for New Prescription Modal - would be implemented with a proper modal component */}
        {showNewPrescriptionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Create New Prescription</CardTitle>
                  <CardDescription>Fill in the details for a new patient prescription</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowNewPrescriptionModal(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </CardHeader>
              
              <CardContent>
                <Link href="/doctor/prescriptions/new" className="block w-full">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Go to Prescription Form
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
} 