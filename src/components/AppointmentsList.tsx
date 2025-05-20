'use client';

import { useAppointments } from '@/hooks/useAppointments';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LoaderCircle, AlertTriangle, Calendar, Lock, MapPin, Video } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { AppointmentChat } from '@/components/messaging/AppointmentChat';

interface AppointmentsListProps {
  userId: string;
  userType: 'patient' | 'doctor';
  includeUser?: boolean;
}

export function AppointmentsList({ userId, userType, includeUser = false }: AppointmentsListProps) {
  const includeOptions = userType === 'patient' 
    ? { includeDoctor: includeUser } 
    : { includePatient: includeUser };

  const {
    appointments,
    loading,
    error,
    hasAccess,
    updateAppointmentStatus
  } = useAppointments(userId, userType, includeOptions);

  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading appointments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!hasAccess) {
    return (
      <Alert className="my-4 border-yellow-500 bg-yellow-50">
        <Lock className="h-4 w-4 text-yellow-500" />
        <AlertTitle>Access Restricted</AlertTitle>
        <AlertDescription>
          You do not have permission to view these appointments.
        </AlertDescription>
      </Alert>
    );
  }

  // Filter appointments based on tab
  const filteredAppointments = appointments.filter(appointment => {
    if (selectedTab === 'upcoming') 
      return ['pending', 'confirmed'].includes(appointment.status);
    if (selectedTab === 'past') 
      return appointment.status === 'completed';
    return appointment.status === 'cancelled';
  });

  // Count appointments by status
  const upcomingCount = appointments.filter(apt => 
    ['pending', 'confirmed'].includes(apt.status)
  ).length;
  
  const pastCount = appointments.filter(apt => 
    apt.status === 'completed'
  ).length;
  
  const cancelledCount = appointments.filter(apt => 
    apt.status === 'cancelled'
  ).length;

  const handleCancel = async (appointmentId: string) => {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      await updateAppointmentStatus(appointmentId, 'cancelled');
    }
  };

  const handleComplete = async (appointmentId: string) => {
    await updateAppointmentStatus(appointmentId, 'completed');
  };

  const formatAppointmentDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'PPPP');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-2 border-b pb-2">
        <Button
          variant={selectedTab === 'upcoming' ? 'default' : 'ghost'}
          onClick={() => setSelectedTab('upcoming')}
        >
          Upcoming ({upcomingCount})
        </Button>
        <Button
          variant={selectedTab === 'past' ? 'default' : 'ghost'}
          onClick={() => setSelectedTab('past')}
        >
          Past ({pastCount})
        </Button>
        <Button
          variant={selectedTab === 'cancelled' ? 'default' : 'ghost'}
          onClick={() => setSelectedTab('cancelled')}
        >
          Cancelled ({cancelledCount})
        </Button>
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">No appointments found</h3>
          <p className="text-muted-foreground">
            {selectedTab === 'upcoming' 
              ? 'You have no upcoming appointments.'
              : selectedTab === 'past' 
                ? 'You have no past appointments.'
                : 'You have no cancelled appointments.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <Card key={appointment.id} className="overflow-hidden">
              <CardHeader className="bg-muted/30 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>
                      {userType === 'patient' && 'doctor' in appointment 
                        ? appointment.doctor?.full_name
                        : userType === 'doctor' && 'patient' in appointment 
                          ? appointment.patient?.full_name
                          : 'Appointment'}
                    </CardTitle>
                    <CardDescription>
                      {userType === 'patient' && 'doctor' in appointment 
                        ? appointment.doctor?.specialty || 'Medical Professional'
                        : 'Patient Appointment'}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      appointment.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                      appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                      {appointment.payment_status === 'paid' ? 'Paid' : 'Payment pending'}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-muted-foreground mr-3" />
                    <div>
                      <p className="text-sm font-medium">Date & Time</p>
                      <p className="text-sm">{formatAppointmentDate(appointment.date)} at {appointment.time_slot}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    {appointment.consultation_type === 'in-person' ? (
                      <MapPin className="h-5 w-5 text-muted-foreground mr-3" />
                    ) : (
                      <Video className="h-5 w-5 text-muted-foreground mr-3" />
                    )}
                    <div>
                      <p className="text-sm font-medium">Consultation Type</p>
                      <p className="text-sm">{appointment.consultation_type === 'in-person' ? 'In-Person Visit' : 'Video Consultation'}</p>
                    </div>
                  </div>
                  
                  {appointment.symptoms && (
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-muted-foreground mr-3" />
                      <div>
                        <p className="text-sm font-medium">Symptoms</p>
                        <p className="text-sm">{appointment.symptoms}</p>
                      </div>
                    </div>
                  )}
                  
                  {appointment.notes && (
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-muted-foreground mr-3" />
                      <div>
                        <p className="text-sm font-medium">Notes</p>
                        <p className="text-sm">{appointment.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              
              {/* Add AppointmentChat component */}
              <div className="border-t">
                <AppointmentChat 
                  appointmentId={appointment.id}
                  collapsed={true}
                  className="rounded-none shadow-none border-0"
                />
              </div>
              
              {(['pending', 'confirmed'].includes(appointment.status)) && (
                <CardFooter className="border-t bg-muted/30 flex justify-end gap-2 pt-3">
                  {userType === 'doctor' && appointment.status === 'confirmed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleComplete(appointment.id)}
                    >
                      Mark as Completed
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleCancel(appointment.id)}
                  >
                    Cancel
                  </Button>
                </CardFooter>
              )}

              {appointment.consultation_type === 'video' && 
                appointment.status === 'confirmed' && (
                  <CardFooter className="border-t bg-muted/30 flex justify-end gap-2 pt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-blue-600 border-blue-600"
                      onClick={() => router.push(`/consultation?appointment=${appointment.id}`)}
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Join Video Call
                    </Button>
                  </CardFooter>
                )}
                
              {/* Add View Details button */}
              <CardFooter className="border-t bg-muted/30 flex justify-end gap-2 pt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(`/appointments/${appointment.id}`)}
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}