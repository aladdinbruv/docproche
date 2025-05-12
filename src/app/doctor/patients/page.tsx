// src/app/doctor/patients/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import {
  Search,
  Filter,
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  FileText,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Plus,
  X,
  Users,
} from "lucide-react";
import { FaUserInjured, FaNotesMedical, FaFileMedical } from "react-icons/fa";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import type { User as UserType, Appointment, HealthRecord } from "@/types/supabase";

export default function DoctorPatientsPage() {
  const router = useRouter();
  const { user, profile, isLoading: authLoading } = useAuth();
  const [patients, setPatients] = useState<UserType[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState<UserType | null>(null);
  const [patientAppointments, setPatientAppointments] = useState<Appointment[]>([]);
  const [patientRecords, setPatientRecords] = useState<HealthRecord[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'full_name',
    direction: 'asc'
  });
  
  const patientsPerPage = 10;
  const supabase = createClientComponentClient();

  // Fetch doctor's patients
  useEffect(() => {
    // Redirect if not logged in or not a doctor
    if (!authLoading && (!user || profile?.role !== 'doctor')) {
      router.push('/auth/login?redirectTo=/doctor/patients');
      return;
    }

    if (user && profile?.role === 'doctor') {
      fetchPatients();
    }
  }, [user, profile, authLoading, router]);

  // Filter patients when search query changes
  useEffect(() => {
    if (patients.length > 0) {
      const filtered = patients.filter(patient => 
        patient.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (patient.email && patient.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (patient.phone_number && patient.phone_number.includes(searchQuery))
      );
      setFilteredPatients(filtered);
      setCurrentPage(1); // Reset to first page on new search
    }
  }, [searchQuery, patients]);

  // Fetch patient details when a patient is selected
  useEffect(() => {
    if (selectedPatient) {
      fetchPatientAppointments(selectedPatient.id);
      fetchPatientHealthRecords(selectedPatient.id);
    }
  }, [selectedPatient]);

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      // Get all appointments for this doctor to identify patients
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('patient_id')
        .eq('doctor_id', profile?.id || user?.id);

      if (appointmentsError) {
        console.error('Error fetching appointments:', appointmentsError);
        throw appointmentsError;
      }

      if (appointments && appointments.length > 0) {
        // Get unique patient IDs manually since distinct() is not available
        const patientIds = [...new Set(appointments.map((apt) => apt.patient_id))];

        // Fetch patient details - make sure to use the users table, not profiles
        const { data: patientsData, error: patientsError } = await supabase
          .from('users')  // Changed from 'profiles' to 'users'
          .select('*')
          .in('id', patientIds)
          .eq('role', 'patient');

        if (patientsError) {
          console.error('Error fetching patient profiles:', patientsError);
          throw patientsError;
        }

        setPatients(patientsData || []);
        setFilteredPatients(patientsData || []);
      } else {
        setPatients([]);
        setFilteredPatients([]);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPatientAppointments = async (patientId: string) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patientId)
        .eq('doctor_id', profile?.id || user?.id)
        .order('date', { ascending: false })
        .order('time_slot', { ascending: false });

      if (error) throw error;
      setPatientAppointments(data || []);
    } catch (error) {
      console.error('Error fetching patient appointments:', error);
    }
  };

  const fetchPatientHealthRecords = async (patientId: string) => {
    try {
      const { data, error } = await supabase
        .from('health_records')
        .select('*')
        .eq('patient_id', patientId)
        .eq('doctor_id', profile?.id || user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatientRecords(data || []);
    } catch (error) {
      console.error('Error fetching patient health records:', error);
    }
  };

  const handleSort = (key: keyof UserType) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig.key === key) {
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    }
    
    setSortConfig({ key, direction });
    
    const sortedPatients = [...filteredPatients].sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];

      if (!aValue && !bValue) return 0;
      if (!aValue) return 1;
      if (!bValue) return -1;
      
      const comparison = String(aValue).localeCompare(String(bValue));
      return direction === 'asc' ? comparison : -comparison;
    });
    
    setFilteredPatients(sortedPatients);
  };

  // Calculate pagination values
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);

  // Navigate through pages
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Create a new appointment for selected patient
  const handleCreateAppointment = (patientId: string) => {
    router.push(`/doctor/appointments/new?patient=${patientId}`);
  };

  // Create a new health record for patient
  const handleCreateHealthRecord = (patientId: string) => {
    router.push(`/doctor/health-records/new?patient=${patientId}`);
  };

  if (authLoading || isLoading) {
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

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-blue-600 text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-2">My Patients</h1>
          <p className="text-blue-100">Manage and view your patient list</p>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-6">
        {/* Patient View Controls */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                className="pl-10"
                placeholder="Search patients by name, email or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedPatient(null)}>
                <Users className="h-4 w-4 mr-2" />
                All Patients
              </Button>
            </div>
          </div>
        </div>

        {/* Patient List and Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient List Panel */}
          {!selectedPatient && (
            <div className="lg:col-span-3">
              <Card>
                <CardHeader className="bg-muted/20">
                  <CardTitle className="text-xl">Patient List</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {currentPatients.length === 0 ? (
                    <div className="p-8 text-center">
                      <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-medium text-gray-800 mb-2">No patients found</h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        {searchQuery 
                          ? "No patients match your search. Try a different search term." 
                          : "You haven't treated any patients yet. They will appear here after their first appointment."}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-12">#</TableHead>
                              <TableHead onClick={() => handleSort('full_name')} className="cursor-pointer">
                                <div className="flex items-center">
                                  Patient Name
                                  {sortConfig.key === 'full_name' && (
                                    <ChevronDown className={`ml-1 h-4 w-4 transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                                  )}
                                </div>
                              </TableHead>
                              <TableHead>Contact Info</TableHead>
                              <TableHead onClick={() => handleSort('created_at')} className="cursor-pointer">
                                <div className="flex items-center">
                                  Patient Since
                                  {sortConfig.key === 'created_at' && (
                                    <ChevronDown className={`ml-1 h-4 w-4 transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                                  )}
                                </div>
                              </TableHead>
                              <TableHead>Last Visit</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {currentPatients.map((patient, index) => (
                              <TableRow 
                                key={patient.id}
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => setSelectedPatient(patient)}
                              >
                                <TableCell className="font-medium">
                                  {indexOfFirstPatient + index + 1}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700">
                                      <User className="h-4 w-4" />
                                    </div>
                                    <div>
                                      <div className="font-medium">{patient.full_name}</div>
                                      {patient.email && <div className="text-xs text-muted-foreground">{patient.email}</div>}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {patient.phone_number && (
                                    <div className="flex items-center gap-1">
                                      <Phone className="h-3 w-3 text-muted-foreground" />
                                      <span>{patient.phone_number}</span>
                                    </div>
                                  )}
                                  {patient.email && (
                                    <div className="flex items-center gap-1">
                                      <Mail className="h-3 w-3 text-muted-foreground" />
                                      <span>{patient.email}</span>
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {patient.created_at ? format(new Date(patient.created_at), 'MMM d, yyyy') : '-'}
                                </TableCell>
                                <TableCell>
                                  {/* This would be calculated from the appointment history */}
                                  -
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="mr-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCreateAppointment(patient.id);
                                    }}
                                  >
                                    <Calendar className="h-3 w-3 mr-1" />
                                    New Appointment
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="text-blue-600"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedPatient(patient);
                                    }}
                                  >
                                    View
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Pagination */}
                      <div className="flex items-center justify-between px-4 py-4 border-t">
                        <div className="text-sm text-muted-foreground">
                          Showing {indexOfFirstPatient + 1} to {Math.min(indexOfLastPatient, filteredPatients.length)} of {filteredPatients.length} patients
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={prevPage} 
                            disabled={currentPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          
                          {[...Array(totalPages)].map((_, i) => {
                            // Show first page, last page, and pages around current page
                            if (
                              i === 0 || 
                              i === totalPages - 1 || 
                              (i >= currentPage - 2 && i <= currentPage + 0)
                            ) {
                              return (
                                <Button
                                  key={i}
                                  variant={currentPage === i + 1 ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => paginate(i + 1)}
                                >
                                  {i + 1}
                                </Button>
                              );
                            }
                            
                            // Add ellipsis
                            if (
                              (i === 1 && currentPage > 3) ||
                              (i === totalPages - 2 && currentPage < totalPages - 2)
                            ) {
                              return <span key={i}>...</span>;
                            }
                            
                            return null;
                          })}
                          
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={nextPage} 
                            disabled={currentPage === totalPages}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Patient Detail View */}
          {selectedPatient && (
            <>
              {/* Patient Information Card */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader className="bg-muted/20 border-b">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-xl">Patient Details</CardTitle>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSelectedPatient(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center mb-6">
                      <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 mb-4">
                        {selectedPatient.profile_image ? (
                          <img 
                            src={selectedPatient.profile_image} 
                            alt={selectedPatient.full_name} 
                            className="w-24 h-24 rounded-full object-cover"
                          />
                        ) : (
                          <FaUserInjured size={40} />
                        )}
                      </div>
                      <h2 className="text-xl font-bold">{selectedPatient.full_name}</h2>
                      {selectedPatient.email && (
                        <p className="text-gray-500">{selectedPatient.email}</p>
                      )}
                    </div>

                    <div className="space-y-4">
                      {selectedPatient.phone_number && (
                        <div className="flex items-center">
                          <Phone className="h-5 w-5 text-blue-500 mr-3" />
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p>{selectedPatient.phone_number}</p>
                          </div>
                        </div>
                      )}

                      {selectedPatient.created_at && (
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 text-blue-500 mr-3" />
                          <div>
                            <p className="text-sm text-gray-500">Patient Since</p>
                            <p>{format(new Date(selectedPatient.created_at), 'MMMM d, yyyy')}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-blue-500 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Total Appointments</p>
                          <p>{patientAppointments.length}</p>
                        </div>
                      </div>

                      {/* Last appointment date */}
                      {patientAppointments.length > 0 && (
                        <div className="flex items-center">
                          <Clock className="h-5 w-5 text-blue-500 mr-3" />
                          <div>
                            <p className="text-sm text-gray-500">Last Visit</p>
                            <p>
                              {format(
                                parseISO(patientAppointments[0].date), 
                                'MMMM d, yyyy'
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex flex-col space-y-2">
                      <Button 
                        onClick={() => handleCreateAppointment(selectedPatient.id)}
                        className="w-full"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Appointment
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => handleCreateHealthRecord(selectedPatient.id)}
                        className="w-full"
                      >
                        <FaFileMedical className="h-4 w-4 mr-2" />
                        Add Health Record
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Patient History Tabs */}
              <div className="lg:col-span-2">
                <Card>
                  <CardContent className="p-0">
                    <Tabs defaultValue="appointments" className="w-full">
                      <TabsList className="w-full rounded-none border-b grid grid-cols-2">
                        <TabsTrigger value="appointments">Appointment History</TabsTrigger>
                        <TabsTrigger value="records">Health Records</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="appointments" className="p-0">
                        {patientAppointments.length === 0 ? (
                          <div className="p-8 text-center">
                            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <h3 className="text-lg font-medium text-gray-800 mb-2">No appointments found</h3>
                            <p className="text-gray-500 max-w-md mx-auto">
                              This patient doesn&apos;t have any appointment history with you.
                            </p>
                            <Button 
                              onClick={() => handleCreateAppointment(selectedPatient.id)}
                              className="mt-4"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Schedule New Appointment
                            </Button>
                          </div>
                        ) : (
                          <div className="divide-y">
                            {patientAppointments.map((apt) => (
                              <div key={apt.id} className="p-4 hover:bg-gray-50">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="flex items-center mb-1">
                                      <span className={`inline-flex items-center px-2 py-1 mr-2 text-xs font-medium rounded-full ${
                                        apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                        apt.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                                        apt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                        apt.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                                        'bg-gray-100 text-gray-800'
                                      }`}>
                                        {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                                      </span>
                                      <span className="font-medium">
                                        {format(parseISO(apt.date), 'MMMM d, yyyy')} at {apt.time_slot}
                                      </span>
                                    </div>
                                    
                                    <p className="text-sm text-gray-600 mt-1">
                                      {apt.consultation_type === 'video' ? 'Video Consultation' : 'In-Person Visit'}
                                    </p>
                                    
                                    {apt.symptoms && (
                                      <div className="mt-2">
                                        <p className="text-sm font-medium text-gray-700">Symptoms:</p>
                                        <p className="text-sm text-gray-600">{apt.symptoms}</p>
                                      </div>
                                    )}
                                    
                                    {apt.notes && (
                                      <div className="mt-2">
                                        <p className="text-sm font-medium text-gray-700">Medical Notes:</p>
                                        <p className="text-sm text-gray-600">{apt.notes}</p>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => router.push(`/doctor/appointments/details/${apt.id}`)}
                                    className="text-blue-600"
                                  >
                                    View Details
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="records" className="p-0">
                        {patientRecords.length === 0 ? (
                          <div className="p-8 text-center">
                            <FaNotesMedical className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <h3 className="text-lg font-medium text-gray-800 mb-2">No health records found</h3>
                            <p className="text-gray-500 max-w-md mx-auto">
                              You haven&apos;t created any health records for this patient yet.
                            </p>
                            <Button 
                              onClick={() => handleCreateHealthRecord(selectedPatient.id)}
                              className="mt-4"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Create Health Record
                            </Button>
                          </div>
                        ) : (
                          <div className="divide-y">
                            {patientRecords.map((record) => (
                              <div key={record.id} className="p-4 hover:bg-gray-50">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="flex items-center mb-1">
                                      <span className="inline-flex items-center px-2 py-1 mr-2 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                        {record.record_type}
                                      </span>
                                      <span className="font-medium">
                                        {record.title}
                                      </span>
                                    </div>
                                    
                                    <p className="text-sm text-gray-500">
                                      Created: {format(new Date(record.created_at), 'MMM d, yyyy')}
                                    </p>
                                    
                                    {record.description && (
                                      <p className="text-sm text-gray-600 mt-2">{record.description}</p>
                                    )}
                                  </div>
                                  
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => router.push(`/doctor/health-records/${record.id}`)}
                                    className="text-blue-600"
                                  >
                                    View Record
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}