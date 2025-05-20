// src/app/doctor/appointments/page.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { format, parseISO, isToday, isTomorrow, isSameDay } from "date-fns";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Video,
  FileText,
  PlusCircle,
  Check,
  X,
  AlertCircle,
  Filter,
  ChevronLeft,
  ChevronRight,
  Search,
  Calendar as CalendarIcon,
  Phone,
  RefreshCw,
  WifiOff
} from "lucide-react";
import { FaVideo, FaHospital, FaUserInjured, FaNotesMedical } from "react-icons/fa";
import { useAuth } from "@/hooks/useAuth";
import { useAppointments } from "@/hooks/useAppointments";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { LoadingWithTimeout, AuthGuard } from "@/components";
import { useNetworkStatus } from "@/components/NetworkStatusProvider";
import { getUserFriendlyErrorMessage } from "@/utils/errorUtils";

export default function DoctorAppointmentsPage() {
  // Wrap the entire component with AuthGuard instead of manually checking auth state
  return (
    <AuthGuard requiredRole="doctor">
      <DoctorAppointmentsContent />
    </AuthGuard>
  );
}

function DoctorAppointmentsContent() {
  const { profile, user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'list'>('day');
  const [currentWeek, setCurrentWeek] = useState<Date[]>(generateWeekDays(new Date()));
  const [notes, setNotes] = useState("");
  const { isOnline } = useNetworkStatus();

  // Fetch doctor's appointments with patient details
  const {
    appointments,
    loading: appointmentsLoading,
    error: appointmentsError,
    updateAppointmentStatus,
    refreshAppointments
  } = useAppointments(
    profile?.id || user?.id || '',
    'doctor',
    { includePatient: true }
  );

  // Generate array of days for the week view
  function generateWeekDays(date: Date): Date[] {
    const days = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay()); // Start from Sunday
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    
    return days;
  }

  // Navigate to previous week
  const goToPreviousWeek = () => {
    const firstDayOfCurrentWeek = currentWeek[0];
    const firstDayOfPreviousWeek = new Date(firstDayOfCurrentWeek);
    firstDayOfPreviousWeek.setDate(firstDayOfCurrentWeek.getDate() - 7);
    setCurrentWeek(generateWeekDays(firstDayOfPreviousWeek));
  };

  // Navigate to next week
  const goToNextWeek = () => {
    const firstDayOfCurrentWeek = currentWeek[0];
    const firstDayOfNextWeek = new Date(firstDayOfCurrentWeek);
    firstDayOfNextWeek.setDate(firstDayOfCurrentWeek.getDate() + 7);
    setCurrentWeek(generateWeekDays(firstDayOfNextWeek));
  };

  // Handle appointment status updates
  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    try {
      await updateAppointmentStatus(appointmentId, newStatus, notes);
      if (selectedAppointment?.id === appointmentId) {
        setSelectedAppointment({ ...selectedAppointment, status: newStatus });
      }
      setIsDetailsOpen(false);
    } catch (error) {
      const errorMessage = getUserFriendlyErrorMessage(error);
      alert(`Could not update appointment status: ${errorMessage}`);
      console.error("Failed to update appointment status:", error);
    }
  };

  // Confirm completion of appointment
  const handleCompleteAppointment = (appointmentId: string) => {
    if (confirm("Are you sure you want to mark this appointment as completed?")) {
      handleStatusUpdate(appointmentId, "completed");
    }
  };

  // Cancel appointment
  const handleCancelAppointment = (appointmentId: string) => {
    if (confirm("Are you sure you want to cancel this appointment?")) {
      handleStatusUpdate(appointmentId, "cancelled");
    }
  };

  // Filter appointments based on selected date and other filters
  const filteredAppointments = appointments.filter(apt => {
    // Date filter - only if viewMode is 'day'
    const aptDate = parseISO(apt.date);
    const dateMatches = viewMode !== 'day' || (selectedDate && isSameDay(aptDate, selectedDate));
    
    // Status filter
    const statusMatches = !filterStatus || apt.status === filterStatus;
    
    // Search query filter - match patient name or symptoms
    const patientName = apt.patient?.full_name?.toLowerCase() || '';
    const symptoms = apt.symptoms?.toLowerCase() || '';
    const searchMatches = !searchQuery || 
      patientName.includes(searchQuery.toLowerCase()) || 
      symptoms.includes(searchQuery.toLowerCase());
    
    return dateMatches && statusMatches && searchMatches;
  });

  // Get appointments for the day view
  const getTodayAppointments = () => {
    return filteredAppointments.filter(apt => {
      const aptDate = parseISO(apt.date);
      return selectedDate && isSameDay(aptDate, selectedDate);
    }).sort((a, b) => {
      return a.time_slot.localeCompare(b.time_slot);
    });
  };

  // Get appointments for the week view
  const getWeekAppointments = (day: Date) => {
    return appointments.filter(apt => {
      const aptDate = parseISO(apt.date);
      return isSameDay(aptDate, day);
    }).sort((a, b) => {
      return a.time_slot.localeCompare(b.time_slot);
    });
  };

  // Format date for display
  const formatAppointmentDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return `Today, ${format(date, 'MMMM d')}`;
    if (isTomorrow(date)) return `Tomorrow, ${format(date, 'MMMM d')}`;
    return format(date, 'EEEE, MMMM d');
  };

  return (
    <LoadingWithTimeout 
      isLoading={appointmentsLoading}
      loadingMessage="Loading your appointments..."
      onRefresh={refreshAppointments}
      timeoutMs={20000}
    >
      <div className="min-h-screen bg-gray-50 pb-12">
        {appointmentsError && (
          <div className="px-4 py-2">
            <Alert variant="destructive" className="mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 mr-2">
                  {!isOnline ? <WifiOff className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <AlertTitle>{!isOnline ? 'Connection Error' : 'Error Loading Appointments'}</AlertTitle>
                  <AlertDescription className="flex justify-between items-center">
                    <span>{getUserFriendlyErrorMessage(appointmentsError)}</span>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={refreshAppointments}
                      className="ml-4"
                    >
                      <RefreshCw className="h-3 w-3 mr-2" />
                      Retry
                    </Button>
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          </div>
        )}
        
        <div className="bg-blue-600 text-white py-6">
          <div className="px-4">
            <h1 className="text-2xl font-bold mb-2">Appointments</h1>
            <p className="text-blue-100">Manage your patient appointments</p>
          </div>
        </div>
        
        <div className="px-4 mt-6">
          {/* Control Bar */}
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* View toggle */}
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'day' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('day')}
                  className="text-sm"
                >
                  <Calendar className="w-4 h-4 mr-1" />
                  Day
                </Button>
                <Button
                  variant={viewMode === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('week')}
                  className="text-sm"
                >
                  <CalendarIcon className="w-4 h-4 mr-1" />
                  Week
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="text-sm"
                >
                  <FileText className="w-4 h-4 mr-1" />
                  List
                </Button>
              </div>
              
              {/* Date selector for day view */}
              {viewMode === 'day' && (
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedDate(addDays(selectedDate || new Date(), -1))}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="text-sm font-medium">
                    {selectedDate ? formatAppointmentDate(selectedDate.toISOString()) : 'Select a date'}
                  </div>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDate(addDays(selectedDate || new Date(), 1))}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
              
              {/* Week navigation */}
              {viewMode === 'week' && (
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={goToPreviousWeek}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="text-sm font-medium">
                    {format(currentWeek[0], 'MMM d')} - {format(currentWeek[6], 'MMM d, yyyy')}
                  </div>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={goToNextWeek}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
              
              {/* Search & Filter */}
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search patients"
                    className="pl-8 pr-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <select
                  className="px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={filterStatus || ''}
                  onChange={(e) => setFilterStatus(e.target.value || null)}
                >
                  <option value="">All status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Day View */}
          {viewMode === 'day' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <h2 className="font-semibold text-gray-800">
                  {selectedDate ? formatAppointmentDate(selectedDate.toISOString()) : 'Today'}
                </h2>
                <p className="text-sm text-gray-500">
                  {getTodayAppointments().length} appointments
                </p>
              </div>
              
              {getTodayAppointments().length === 0 ? (
                <div className="p-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-800 mb-2">No appointments for this day</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    There are no appointments scheduled for this day. Select a different date or create a new appointment.
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {getTodayAppointments().map((apt) => (
                    <div 
                      key={apt.id} 
                      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedAppointment(apt);
                        setIsDetailsOpen(true);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3">
                          <div className="bg-blue-100 text-blue-700 p-2 rounded-full h-10 w-10 flex items-center justify-center">
                            {apt.consultation_type === 'video' ? <FaVideo /> : <FaHospital />}
                          </div>
                          
                          <div>
                            <h3 className="font-medium">{apt.patient?.full_name || 'Patient'}</h3>
                            <p className="text-sm text-gray-500">{apt.time_slot}</p>
                            <div className="flex items-center mt-1">
                              <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                                apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                apt.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                                apt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                              </span>
                              <span className="text-sm text-gray-500 ml-2">
                                {apt.consultation_type === 'video' ? 'Video Consultation' : 'In-Person Visit'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          {apt.status === 'confirmed' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-green-600 border-green-600 hover:bg-green-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCompleteAppointment(apt.id);
                              }}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Complete
                            </Button>
                          )}
                          
                          {(apt.status === 'confirmed' || apt.status === 'pending') && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelAppointment(apt.id);
                              }}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Week View */}
          {viewMode === 'week' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="grid grid-cols-7 border-b">
                {currentWeek.map((day, index) => (
                  <div 
                    key={index}
                    className={`text-center p-3 ${
                      isToday(day) ? 'bg-blue-50 border-b-2 border-blue-500' : ''
                    }`}
                  >
                    <p className="text-xs text-gray-500">{format(day, 'EEE')}</p>
                    <p className={`text-lg font-semibold ${isToday(day) ? 'text-blue-600' : ''}`}>
                      {format(day, 'd')}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 min-h-[400px]">
                {currentWeek.map((day, index) => {
                  const dayAppointments = getWeekAppointments(day);
                  return (
                    <div 
                      key={index} 
                      className={`border-r last:border-r-0 p-2 ${
                        isToday(day) ? 'bg-blue-50' : ''
                      }`}
                    >
                      {dayAppointments.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                          No appointments
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {dayAppointments.map((apt) => (
                            <div 
                              key={apt.id}
                              className={`p-2 rounded text-sm cursor-pointer ${
                                apt.status === 'confirmed' ? 'bg-green-100 hover:bg-green-200' :
                                apt.status === 'pending' ? 'bg-blue-100 hover:bg-blue-200' :
                                apt.status === 'cancelled' ? 'bg-red-100 hover:bg-red-200' :
                                'bg-gray-100 hover:bg-gray-200'
                              }`}
                              onClick={() => {
                                setSelectedAppointment(apt);
                                setIsDetailsOpen(true);
                              }}
                            >
                              <div className="font-medium truncate">{apt.patient?.full_name}</div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs">{apt.time_slot}</span>
                                {apt.consultation_type === 'video' ? 
                                  <Video className="h-3 w-3" /> : 
                                  <MapPin className="h-3 w-3" />
                                }
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* List View */}
          {viewMode === 'list' && (
            <div className="space-y-4">
              {filteredAppointments.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-800 mb-2">No appointments found</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    There are no appointments matching your current filters. Try changing your search terms or filters.
                  </p>
                </div>
              ) : (
                filteredAppointments
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((apt) => (
                    <Card key={apt.id} className="overflow-hidden">
                      <div 
                        className="cursor-pointer"
                        onClick={() => {
                          setSelectedAppointment(apt);
                          setIsDetailsOpen(true);
                        }}
                      >
                        <CardHeader className="bg-muted/30 pb-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle>{apt.patient?.full_name || 'Patient'}</CardTitle>
                              <CardDescription>
                                {formatAppointmentDate(apt.date)} at {apt.time_slot}
                              </CardDescription>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                apt.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                                apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                apt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                              </span>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="pt-4">
                          <div className="space-y-3">
                            <div className="flex items-start">
                              {apt.consultation_type === 'in-person' ? (
                                <MapPin className="h-5 w-5 text-muted-foreground mr-3" />
                              ) : (
                                <Video className="h-5 w-5 text-muted-foreground mr-3" />
                              )}
                              <div>
                                <p className="text-sm font-medium">Consultation Type</p>
                                <p className="text-sm">{apt.consultation_type === 'in-person' ? 'In-Person Visit' : 'Video Consultation'}</p>
                              </div>
                            </div>
                            
                            {apt.symptoms && (
                              <div className="flex items-start">
                                <AlertCircle className="h-5 w-5 text-muted-foreground mr-3" />
                                <div>
                                  <p className="text-sm font-medium">Symptoms</p>
                                  <p className="text-sm">{apt.symptoms}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </div>
                      
                      <CardFooter className="border-t bg-muted/30 flex justify-end gap-2 pt-3">
                        {apt.status === 'confirmed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-600 hover:bg-green-50"
                            onClick={() => handleCompleteAppointment(apt.id)}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Complete
                          </Button>
                        )}
                        
                        {(apt.status === 'confirmed' || apt.status === 'pending') && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCancelAppointment(apt.id)}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))
              )}
            </div>
          )}
        </div>
        
        {/* Appointment Details Modal */}
        {isDetailsOpen && selectedAppointment && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-bold">Appointment Details</h2>
                  <button 
                    onClick={() => setIsDetailsOpen(false)} 
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-6">
                  {/* Patient Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-blue-700">Patient Information</h3>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700">
                          <FaUserInjured size={20} />
                        </div>
                        <div>
                          <p className="font-medium text-lg">{selectedAppointment.patient?.full_name || 'Patient'}</p>
                          <p className="text-gray-500 text-sm">Patient ID: {selectedAppointment.patient_id}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center">
                          <Phone className="text-blue-500 mr-2 h-4 w-4" />
                          <span>{selectedAppointment.patient?.phone_number || 'No phone number'}</span>
                        </div>
                        <div className="flex items-center">
                          <User className="text-blue-500 mr-2 h-4 w-4" />
                          <span>Patient since: {selectedAppointment.patient?.created_at ? format(new Date(selectedAppointment.patient.created_at), 'MMM yyyy') : 'Unknown'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Appointment Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-blue-700">Appointment Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3">
                      <div className="flex items-start">
                        <Calendar className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Date</p>
                          <p className="font-medium">{formatAppointmentDate(selectedAppointment.date)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Clock className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Time</p>
                          <p className="font-medium">{selectedAppointment.time_slot}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        {selectedAppointment.consultation_type === 'in-person' ? (
                          <MapPin className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                        ) : (
                          <Video className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                        )}
                        <div>
                          <p className="text-sm text-gray-500">Consultation Type</p>
                          <p className="font-medium">
                            {selectedAppointment.consultation_type === 'in-person' ? 'In-Person Visit' : 'Video Consultation'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <p className="font-medium capitalize">{selectedAppointment.status}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Symptoms & Notes */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-blue-700">Medical Information</h3>
                    
                    {selectedAppointment.symptoms && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-1">Symptoms</p>
                        <div className="p-3 bg-gray-50 rounded border">
                          {selectedAppointment.symptoms}
                        </div>
                      </div>
                    )}
                    
                    {selectedAppointment.notes && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-1">Previous Notes</p>
                        <div className="p-3 bg-gray-50 rounded border">
                          {selectedAppointment.notes}
                        </div>
                      </div>
                    )}
                    
                    {/* Add notes field */}
                    <div className="mt-4">
                      <label htmlFor="notes" className="block text-sm text-gray-500 mb-1">
                        Add Medical Notes
                      </label>
                      <textarea
                        id="notes"
                        rows={4}
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Add notes about this appointment..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-gray-50 border-t flex justify-end gap-2">
                {selectedAppointment.status === 'confirmed' && (
                  <Button
                    onClick={() => handleStatusUpdate(selectedAppointment.id, 'completed')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Mark as Completed
                  </Button>
                )}
                
                {(selectedAppointment.status === 'confirmed' || selectedAppointment.status === 'pending') && (
                  <Button
                    variant="destructive"
                    onClick={() => handleStatusUpdate(selectedAppointment.id, 'cancelled')}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel Appointment
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  onClick={() => setIsDetailsOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </LoadingWithTimeout>
  );
}               

