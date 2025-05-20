"use client";

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { AppointmentChat } from '@/components/messaging/AppointmentChat';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, AlertTriangle, MapPin, Video, User, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface AppointmentDetailsProps {
  params: {
    id: string;
  };
}

export default function AppointmentDetailsPage({ params }: AppointmentDetailsProps) {
  // Access id directly from params since we're using the client component pattern
  const appointmentId = params.id;
  
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, profile, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/auth/login?redirectTo=' + encodeURIComponent(`/appointments/${appointmentId}`));
      return;
    }
    
    const fetchAppointmentDetails = async () => {
      setLoading(true);
      try {
        const isDoctor = profile?.role === 'doctor';
        
        const { data, error } = await supabase
          .from('appointments')
          .select(`
            *,
            doctor:doctor_id(*),
            patient:patient_id(*)
          `)
          .eq('id', appointmentId)
          .single();
          
        if (error) throw error;
        
        // Check if the user has permission to view this appointment
        if (isDoctor && data.doctor_id !== user.id) {
          setError('You do not have permission to view this appointment');
          setLoading(false);
          return;
        } else if (!isDoctor && data.patient_id !== user.id) {
          setError('You do not have permission to view this appointment');
          setLoading(false);
          return;
        }
        
        setAppointment(data);
      } catch (err: any) {
        console.error('Error fetching appointment:', err);
        setError(err.message || 'An error occurred while fetching the appointment details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppointmentDetails();
  }, [appointmentId, user, authLoading, profile, router, supabase]);
  
  const handleCancel = async () => {
    if (!appointment) return;
    
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointment.id);
        
      if (error) throw error;
      
      // Refresh the appointment data
      setAppointment({
        ...appointment,
        status: 'cancelled'
      });
    } catch (err: any) {
      console.error('Error cancelling appointment:', err);
      alert('Failed to cancel appointment: ' + err.message);
    }
  };
  
  const formatAppointmentDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'PPPP');
    } catch (e) {
      return dateStr;
    }
  };
  
  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p>{error}</p>
          <Button 
            onClick={() => router.push('/appointments')}
            className="mt-4"
            variant="outline"
          >
            Back to Appointments
          </Button>
        </div>
      </div>
    );
  }
  
  if (!appointment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Appointment Not Found</h2>
          <p>The appointment you are looking for does not exist or you don't have permission to view it.</p>
          <Button 
            onClick={() => router.push('/appointments')}
            className="mt-4"
            variant="outline"
          >
            Back to Appointments
          </Button>
        </div>
      </div>
    );
  }
  
  const isDoctor = profile?.role === 'doctor';
  const isPastAppointment = new Date(`${appointment.date}T${appointment.time_slot}`) < new Date();
  const canCancel = ['pending', 'confirmed'].includes(appointment.status) && !isPastAppointment;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Appointment Details</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="bg-muted/30">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>
                    {isDoctor 
                      ? appointment.patient?.full_name
                      : `Dr. ${appointment.doctor?.full_name}`
                    }
                  </CardTitle>
                  <CardDescription>
                    {isDoctor 
                      ? 'Patient'
                      : appointment.doctor?.specialty || 'Medical Professional'
                    }
                  </CardDescription>
                </div>
                <div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    appointment.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                    appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    appointment.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-muted-foreground mr-3" />
                  <div>
                    <p className="text-sm font-medium">Date</p>
                    <p>{formatAppointmentDate(appointment.date)}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-muted-foreground mr-3" />
                  <div>
                    <p className="text-sm font-medium">Time</p>
                    <p>{appointment.time_slot}</p>
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
                    <p>{appointment.consultation_type === 'in-person' ? 'In-Person Visit' : 'Video Consultation'}</p>
                    {appointment.consultation_type === 'video' && appointment.status === 'confirmed' && !isPastAppointment && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 text-blue-600 border-blue-600"
                        onClick={() => router.push(`/consultation?appointment=${appointment.id}`)}
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Join Video Call
                      </Button>
                    )}
                  </div>
                </div>
                
                {appointment.symptoms && (
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-muted-foreground mr-3" />
                    <div>
                      <p className="text-sm font-medium">Symptoms</p>
                      <p>{appointment.symptoms}</p>
                    </div>
                  </div>
                )}
                
                {appointment.notes && (
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-muted-foreground mr-3" />
                    <div>
                      <p className="text-sm font-medium">Notes</p>
                      <p>{appointment.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            
            {canCancel && (
              <CardFooter className="border-t bg-muted/30 flex justify-end gap-2 pt-3">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleCancel}
                >
                  Cancel Appointment
                </Button>
              </CardFooter>
            )}
          </Card>
          
          {/* Appointment Chat */}
          <AppointmentChat 
            appointmentId={appointment.id} 
            collapsed={false}
          />
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {isDoctor ? 'Patient Information' : 'Doctor Information'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start">
                  <User className="h-5 w-5 text-muted-foreground mr-3" />
                  <div>
                    <p className="text-sm font-medium">Name</p>
                    <p>
                      {isDoctor 
                        ? appointment.patient?.full_name
                        : `Dr. ${appointment.doctor?.full_name}`
                      }
                    </p>
                  </div>
                </div>
                
                {!isDoctor && appointment.doctor?.specialty && (
                  <div className="flex items-start">
                    <div className="h-5 w-5 text-muted-foreground mr-3">🏥</div>
                    <div>
                      <p className="text-sm font-medium">Specialty</p>
                      <p>{appointment.doctor.specialty}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start">
                  <div className="h-5 w-5 text-muted-foreground mr-3">📧</div>
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p>
                      {isDoctor 
                        ? appointment.patient?.email
                        : appointment.doctor?.email
                      }
                    </p>
                  </div>
                </div>
                
                {/* Payment Status */}
                <div className="pt-4 border-t mt-4">
                  <p className="text-sm font-medium mb-2">Payment Status</p>
                  <div className={`px-3 py-2 rounded ${
                    appointment.payment_status === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {appointment.payment_status === 'paid' 
                      ? 'Paid' 
                      : 'Payment Pending'
                    }
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 