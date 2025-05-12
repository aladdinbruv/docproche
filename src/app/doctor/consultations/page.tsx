"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { motion } from "framer-motion";
import { format, parseISO, isToday, isBefore, addMonths, startOfMonth, endOfMonth } from "date-fns";
import {
  Calendar,
  Search,
  Filter,
  FileText,
  User,
  Clock,
  ClipboardList,
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit,
  ExternalLink,
  MoreHorizontal,
  X,
  AlertCircle,
  Check,
  Video,
  MapPin,
  Phone
} from "lucide-react";
import { FaStethoscope, FaNotesMedical, FaUserMd, FaFilePrescription } from "react-icons/fa";

import { useAuth } from "@/hooks/useAuth";
import { useAppointments } from "@/hooks/useAppointments";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

type Appointment = {
  id: string;
  patient_id: string;
  doctor_id: string;
  date: string;
  time_slot: string;
  status: string;
  consultation_type: string;
  symptoms?: string;
  notes?: string;
  patient?: {
    id: string;
    full_name: string;
    email?: string;
    phone_number?: string;
    profile_image?: string;
  };
  created_at: string;
  updated_at?: string;
  payment_status?: string;
};

export default function DoctorConsultationsPage() {
  const router = useRouter();
  const { user, profile, isLoading: authLoading } = useAuth();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<Appointment | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>("completed");
  const [filterPeriod, setFilterPeriod] = useState<'recent' | 'month' | 'all'>('recent');
  const [filterType, setFilterType] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'date',
    direction: 'desc'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [consultationsPerPage] = useState(10);
  
  const supabase = createClientComponentClient();

  // Fetch doctor's appointments with patient details
  const {
    appointments,
    loading: appointmentsLoading,
    error: appointmentsError
  } = useAppointments(
    profile?.id || user?.id || '',
    'doctor',
    { includePatient: true }
  );

  useEffect(() => {
    // Redirect if not logged in or not a doctor
    if (!authLoading && (!user || profile?.role !== 'doctor')) {
      router.push('/auth/login?redirectTo=/doctor/consultations');
    }
  }, [user, profile, authLoading, router]);

  // Handle consultation details view
  const openConsultationDetails = (consultation: Appointment) => {
    setSelectedConsultation(consultation);
    setIsDetailsOpen(true);
  };

  // Handle sort
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig.key === key) {
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    }
    
    setSortConfig({ key, direction });
  };

  // Navigate to previous/next month
  const goToPreviousMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, -1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
  };

  // Format date for display
  const formatConsultationDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return `Today, ${format(date, 'MMMM d, yyyy')}`;
    return format(date, 'EEEE, MMMM d, yyyy');
  };

  // Filter consultations based on filters and search query
  const filteredConsultations = appointments.filter(apt => {
    // Only completed appointments are considered consultations
    const statusMatches = !filterStatus || apt.status === filterStatus;
    
    // Period filter
    const aptDate = parseISO(apt.date);
    let periodMatches = true;
    
    if (filterPeriod === 'recent') {
      const threeMonthsAgo = addMonths(new Date(), -3);
      periodMatches = isBefore(threeMonthsAgo, aptDate);
    } else if (filterPeriod === 'month') {
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);
      periodMatches = aptDate >= start && aptDate <= end;
    }
    
    // Type filter
    const typeMatches = !filterType || apt.consultation_type === filterType;
    
    // Search query filter - match patient name or symptoms or notes
    const patientName = apt.patient?.full_name?.toLowerCase() || '';
    const symptoms = apt.symptoms?.toLowerCase() || '';
    const notes = apt.notes?.toLowerCase() || '';
    const searchMatches = !searchQuery || 
      patientName.includes(searchQuery.toLowerCase()) || 
      symptoms.includes(searchQuery.toLowerCase()) ||
      notes.includes(searchQuery.toLowerCase());
    
    return statusMatches && periodMatches && typeMatches && searchMatches;
  });

  // Sort consultations
  const sortedConsultations = [...filteredConsultations].sort((a, b) => {
    const aValue = a[sortConfig.key as keyof Appointment];
    const bValue = b[sortConfig.key as keyof Appointment];
    
    if (!aValue && !bValue) return 0;
    if (!aValue) return 1;
    if (!bValue) return -1;
    
    let comparison = 0;
    if (sortConfig.key === 'date') {
      // Sort dates by comparing timestamps
      comparison = new Date(aValue as string).getTime() - new Date(bValue as string).getTime();
    } else {
      // Generic string comparison for other fields
      comparison = String(aValue).localeCompare(String(bValue));
    }
    
    return sortConfig.direction === 'asc' ? comparison : -comparison;
  });

  // Pagination
  const indexOfLastConsultation = currentPage * consultationsPerPage;
  const indexOfFirstConsultation = indexOfLastConsultation - consultationsPerPage;
  const currentConsultations = sortedConsultations.slice(indexOfFirstConsultation, indexOfLastConsultation);
  const totalPages = Math.ceil(sortedConsultations.length / consultationsPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  if (authLoading || appointmentsLoading) {
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

  if (appointmentsError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> There was a problem loading your consultations. Please try again later.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-blue-600 text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-2">Consultations</h1>
          <p className="text-blue-100">View and manage your past patient consultations</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 mt-6">
        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  className="pl-10"
                  placeholder="Search patients, symptoms, or notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div>
                <select
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={filterStatus || ''}
                  onChange={(e) => setFilterStatus(e.target.value || null)}
                >
                  <option value="completed">Completed Consultations</option>
                  <option value="cancelled">Cancelled Appointments</option>
                  <option value="">All Appointments</option>
                </select>
              </div>
              
              <div>
                <select
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={filterPeriod}
                  onChange={(e) => setFilterPeriod(e.target.value as any)}
                >
                  <option value="recent">Last 3 Months</option>
                  <option value="month">This Month</option>
                  <option value="all">All Time</option>
                </select>
              </div>
            </div>
            
            {filterPeriod === 'month' && (
              <div className="flex items-center justify-between mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={goToPreviousMonth}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous Month
                </Button>
                <h3 className="text-lg font-medium">
                  {format(currentMonth, 'MMMM yyyy')}
                </h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={goToNextMonth}
                >
                  Next Month
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Consultation List */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Consultation History</CardTitle>
              <div className="text-sm text-gray-500">
                Total: {filteredConsultations.length} consultations
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {currentConsultations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <FaStethoscope className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-1">No consultations found</h3>
                <p className="text-gray-500 max-w-md text-center">
                  {searchQuery 
                    ? "No consultations match your search query. Try different search terms." 
                    : "You don't have any completed consultations yet."}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px]">
                          <div 
                            className="flex items-center cursor-pointer"
                            onClick={() => handleSort('date')}
                          >
                            Date
                            {sortConfig.key === 'date' && (
                              <ChevronDown 
                                className={`ml-1 h-4 w-4 transition-transform ${
                                  sortConfig.direction === 'desc' ? 'rotate-180' : ''
                                }`}
                              />
                            )}
                          </div>
                        </TableHead>
                        <TableHead>
                          <div 
                            className="flex items-center cursor-pointer"
                            onClick={() => handleSort('patient_id')}
                          >
                            Patient
                            {sortConfig.key === 'patient_id' && (
                              <ChevronDown 
                                className={`ml-1 h-4 w-4 transition-transform ${
                                  sortConfig.direction === 'desc' ? 'rotate-180' : ''
                                }`}
                              />
                            )}
                          </div>
                        </TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>
                          <div 
                            className="flex items-center cursor-pointer"
                            onClick={() => handleSort('time_slot')}
                          >
                            Time
                            {sortConfig.key === 'time_slot' && (
                              <ChevronDown 
                                className={`ml-1 h-4 w-4 transition-transform ${
                                  sortConfig.direction === 'desc' ? 'rotate-180' : ''
                                }`}
                              />
                            )}
                          </div>
                        </TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentConsultations.map((consultation) => (
                        <TableRow 
                          key={consultation.id} 
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => openConsultationDetails(consultation)}
                        >
                          <TableCell className="font-medium">
                            {format(parseISO(consultation.date), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700">
                                <User className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="font-medium">
                                  {consultation.patient?.full_name || 'Patient'}
                                </div>
                                {consultation.patient?.phone_number && (
                                  <div className="text-xs text-gray-500 flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {consultation.patient.phone_number}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {consultation.consultation_type === 'video' ? (
                                <>
                                  <Video className="h-3 w-3 text-blue-500" />
                                  <span>Video</span>
                                </>
                              ) : (
                                <>
                                  <MapPin className="h-3 w-3 text-green-500" />
                                  <span>In-Person</span>
                                </>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{consultation.time_slot}</TableCell>
                          <TableCell>
                            <div className="max-w-[200px] truncate">
                              {consultation.notes || 
                                <span className="text-gray-400 italic">No notes</span>
                              }
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/doctor/consultation?appointment=${consultation.id}`);
                                }}>
                                  <FileText className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/doctor/health-records?patient=${consultation.patient_id}`);
                                }}>
                                  <ClipboardList className="h-4 w-4 mr-2" />
                                  Patient Records
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-4 border-t">
                    <div className="text-sm text-gray-500">
                      Showing {indexOfFirstConsultation + 1} to {Math.min(indexOfLastConsultation, filteredConsultations.length)} of {filteredConsultations.length} consultations
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
                      
                      {Array.from({ length: totalPages }, (_, i) => (
                        // Show limited page numbers with ellipsis
                        (i === 0 || i === totalPages - 1 || 
                         (i >= currentPage - 2 && i <= currentPage + 0)) && (
                          <Button
                            key={i}
                            variant={currentPage === i + 1 ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => paginate(i + 1)}
                          >
                            {i + 1}
                          </Button>
                        )
                      ))}
                      
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
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Consultation Details Modal */}
      {isDetailsOpen && selectedConsultation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">Consultation Details</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsDetailsOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left column - Patient info */}
                <div className="md:col-span-1">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Patient Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center mb-4">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 mb-3">
                          {selectedConsultation.patient?.profile_image ? (
                            <img 
                              src={selectedConsultation.patient.profile_image} 
                              alt={selectedConsultation.patient?.full_name || 'Patient'} 
                              className="w-20 h-20 rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-8 w-8" />
                          )}
                        </div>
                        <h3 className="font-bold text-lg">{selectedConsultation.patient?.full_name || 'Patient'}</h3>
                        {selectedConsultation.patient?.email && (
                          <p className="text-gray-500 text-sm">{selectedConsultation.patient.email}</p>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        {selectedConsultation.patient?.phone_number && (
                          <div className="flex items-center text-sm">
                            <Phone className="h-4 w-4 mr-2 text-gray-500" />
                            <span>{selectedConsultation.patient.phone_number}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{format(parseISO(selectedConsultation.date), 'MMMM d, yyyy')}</span>
                        </div>
                        
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{selectedConsultation.time_slot}</span>
                        </div>
                        
                        <div className="flex items-center text-sm">
                          {selectedConsultation.consultation_type === 'video' ? (
                            <Video className="h-4 w-4 mr-2 text-gray-500" />
                          ) : (
                            <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                          )}
                          <span>
                            {selectedConsultation.consultation_type === 'video' 
                              ? 'Video Consultation' 
                              : 'In-Person Consultation'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t">
                        <Button 
                          className="w-full"
                          onClick={() => router.push(`/doctor/health-records?patient=${selectedConsultation.patient_id}`)}
                        >
                          <ClipboardList className="h-4 w-4 mr-2" />
                          View Health Records
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Right column - Consultation details */}
                <div className="md:col-span-2">
                  <Tabs defaultValue="notes">
                    <TabsList className="w-full">
                      <TabsTrigger value="notes">Consultation Notes</TabsTrigger>
                      <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="notes" className="mt-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Medical Notes</CardTitle>
                          <CardDescription>
                            Notes recorded during the consultation
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {selectedConsultation.notes ? (
                            <div className="p-4 bg-gray-50 rounded-md whitespace-pre-wrap">
                              {selectedConsultation.notes}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                              <FileText className="h-10 w-10 text-gray-300 mb-2" />
                              <p className="text-gray-500">No notes were recorded for this consultation.</p>
                            </div>
                          )}
                        </CardContent>
                        <CardFooter className="border-t bg-gray-50 flex justify-end">
                          <Button
                            variant="outline"
                            onClick={() => router.push(`/doctor/consultation?appointment=${selectedConsultation.id}`)}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Full Consultation
                          </Button>
                        </CardFooter>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="symptoms" className="mt-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Reported Symptoms</CardTitle>
                          <CardDescription>
                            Symptoms reported by the patient before the consultation
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {selectedConsultation.symptoms ? (
                            <div className="p-4 bg-gray-50 rounded-md">
                              {selectedConsultation.symptoms}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                              <AlertCircle className="h-10 w-10 text-gray-300 mb-2" />
                              <p className="text-gray-500">No symptoms were reported for this consultation.</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                  
                  <div className="mt-4 flex space-x-4">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => router.push(`/doctor/appointments/new?patient=${selectedConsultation.patient_id}`)}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Follow-up
                    </Button>
                    
                    <Button 
                      className="flex-1"
                      onClick={() => router.push(`/doctor/consultation?appointment=${selectedConsultation.id}`)}
                    >
                      <FaStethoscope className="h-4 w-4 mr-2" />
                      View Full Details
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 