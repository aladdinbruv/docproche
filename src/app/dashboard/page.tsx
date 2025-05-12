'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useAppointments } from "@/hooks/useAppointments";
import { useHealthRecords } from "@/hooks/useHealthRecords";
import { Prescription, Appointment } from "@/types/supabase";
import { createClientComponentClient } from "@/lib/supabase";
import { usePayments } from "@/hooks/usePayments";
import { PaymentSummary } from "@/components";
import { FileText, Clipboard, DollarSign, Settings } from "lucide-react";
import { DashboardCard } from "@/components/ui/dashboard-card";

// Define interfaces for types used in the component
interface Message {
  id: string;
  content: string;
  created_at: string;
  recipient_id: string;
  read: boolean;
  sender?: {
    full_name: string;
  };
  sender_id: string;
}

// Define the structure that's expected in the component for appointments
interface ExtendedAppointment extends Appointment {
  appointment_date: string; // This comes from the date field in the original Appointment
  appointment_type: string; // This comes from the consultation_type field in the original Appointment
  doctor?: {
    full_name: string;
    specialty?: string;
  };
  patient?: {
    full_name: string;
  };
}

export default function DashboardPage() {
  const { user, isLoading: authLoading, profile } = useAuth();
  const [unreadMessages, setUnreadMessages] = useState<Message[]>([]);
  const [isMessagesLoading, setIsMessagesLoading] = useState(true);
  
  // Fetch payments for the current user
  const { payments, appointmentDetails, isLoading: paymentsLoading } = usePayments();

  // Fetch appointments for the current user
  const { 
    appointments, 
    loading: appointmentsLoading, 
    error: appointmentsError
  } = useAppointments(
    profile?.id || user?.id || '', 
    profile?.role as 'patient' | 'doctor' || 'patient', 
    { includeDoctor: profile?.role === 'patient', includePatient: profile?.role === 'doctor' }
  );

  // We'll use these default values for useHealthRecords when user is not a patient
  const defaultHealthRecordsValue = { 
    prescriptions: [] as Prescription[], 
    loading: false, 
    error: null 
  };
  
  // Always call useHealthRecords to maintain hook order, but conditionally use the result
  const healthRecordsHook = useHealthRecords(profile?.id || user?.id || '');
  
  // Determine which health records to use based on user role
  const {
    prescriptions,
    loading: healthRecordsLoading,
    error: healthRecordsError
  } = profile?.role === 'patient' ? healthRecordsHook : defaultHealthRecordsValue;

  // Fetch unread messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!user && !profile) return;
      
      setIsMessagesLoading(true);
      const supabase = createClientComponentClient();
      
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*, sender:sender_id(*)')
          .eq('recipient_id', profile?.id || user?.id || '')
          .eq('read', false)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setUnreadMessages(data || []);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setIsMessagesLoading(false);
      }
    };
    
    fetchMessages();
  }, [user, profile]);

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Format time to readable format
  const formatTime = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    };
    return new Date(dateString).toLocaleTimeString('en-US', options);
  };

  if (authLoading) {
    return <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  if (!user && !profile) {
    return <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h2 className="text-xl font-semibold mb-4">Please sign in to view your dashboard</h2>
      <Link href="/auth/login" className="px-4 py-2 bg-primary text-white rounded">
        Sign In
      </Link>
    </div>;
  }

  // Transform appointments to match our expected structure
  const processedAppointments = appointments.map(apt => {
    return {
      ...apt,
      appointment_date: apt.date,
      appointment_type: apt.consultation_type === 'video' ? 'virtual' : apt.consultation_type
    } as ExtendedAppointment;
  });

  // Get upcoming appointments (status "scheduled" or "confirmed")
  const upcomingAppointments = processedAppointments
    .filter(apt => apt.status === 'confirmed' || apt.status === 'pending')
    .sort((a, b) => 
      new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime()
    );

  // Get active prescriptions (not expired)
  const activePrescriptions = prescriptions.filter(
    (prescription: Prescription) => 
      prescription.expiry_date ? new Date(prescription.expiry_date) > new Date() : true
  );

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {profile?.full_name || user?.email?.split('@')[0] || 'User'}</p>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-[var(--card)] text-[var(--card-foreground)] rounded-[var(--radius)] border border-[var(--border)] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Upcoming Appointments</h3>
            <div className="bg-primary/10 text-primary p-2 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            {appointmentsLoading ? (
              <span className="text-3xl font-bold animate-pulse">...</span>
            ) : (
              <>
            <span className="text-3xl font-bold">{upcomingAppointments.length}</span>
            <span className="text-muted-foreground">scheduled</span>
              </>
            )}
          </div>
          <Link 
            href="/dashboard/appointments" 
            className="text-sm text-primary hover:underline mt-4 inline-block"
          >
            View all appointments →
          </Link>
        </div>
        
        <div className="p-6 bg-[var(--card)] text-[var(--card-foreground)] rounded-[var(--radius)] border border-[var(--border)] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Payments</h3>
            <div className="bg-emerald-100 text-emerald-600 p-2 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            {paymentsLoading ? (
              <span className="text-3xl font-bold animate-pulse">...</span>
            ) : (
              <>
                <span className="text-3xl font-bold">${payments.reduce((total, payment) => 
                  payment.status === 'successful' ? total + payment.amount : total, 0).toFixed(2)}</span>
                <span className="text-muted-foreground">paid</span>
              </>
            )}
          </div>
          <Link 
            href="/payments" 
            className="text-sm text-primary hover:underline mt-4 inline-block"
          >
            View payment history →
          </Link>
        </div>
        
        {profile?.role === 'patient' && (
        <div className="p-6 bg-[var(--card)] text-[var(--card-foreground)] rounded-[var(--radius)] border border-[var(--border)] shadow-sm">
          <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Prescriptions</h3>
              <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
              {healthRecordsLoading ? (
                <span className="text-3xl font-bold animate-pulse">...</span>
              ) : (
                <>
                  <span className="text-3xl font-bold">{activePrescriptions.length}</span>
                  <span className="text-muted-foreground">active</span>
                </>
              )}
            </div>
            <Link 
              href="/prescriptions" 
              className="text-sm text-primary hover:underline mt-4 inline-block"
            >
              View prescriptions →
            </Link>
          </div>
        )}
        
        {profile?.role === 'doctor' && (
          <div className="p-6 bg-[var(--card)] text-[var(--card-foreground)] rounded-[var(--radius)] border border-[var(--border)] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Patients</h3>
              <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              {appointmentsLoading ? (
                <span className="text-3xl font-bold animate-pulse">...</span>
              ) : (
                <>
                  <span className="text-3xl font-bold">
                    {Array.from(new Set(processedAppointments.map(apt => apt.patient_id))).length}
                  </span>
                  <span className="text-muted-foreground">total</span>
                </>
              )}
          </div>
          <Link 
              href="/dashboard/patients" 
            className="text-sm text-primary hover:underline mt-4 inline-block"
          >
              View all patients →
          </Link>
        </div>
        )}
      </div>
      
      {/* Main dashboard content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Upcoming appointments + Payments for patients */}
        <div className="lg:col-span-2 space-y-6">
      {/* Upcoming appointments */}
          <div className="bg-[var(--card)] text-[var(--card-foreground)] rounded-[var(--radius)] border border-[var(--border)] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[var(--border)]">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Upcoming Appointments</h2>
                <Link href="/appointments" className="text-sm text-primary hover:underline">
                  View all
                </Link>
              </div>
            </div>
            
            {appointmentsLoading ? (
              <div className="p-6 flex justify-center">
                <div className="h-10 w-10 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
              </div>
            ) : upcomingAppointments.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-muted-foreground">No upcoming appointments</p>
                <Link href="/doctors" className="mt-2 inline-block text-primary hover:underline">
                  Book an appointment
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {upcomingAppointments.slice(0, 5).map((appointment) => (
                  <div key={appointment.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {profile?.role === 'patient' 
                            ? `Dr. ${appointment.doctor?.full_name || 'Unknown'}`
                            : `${appointment.patient?.full_name || 'Unknown Patient'}`
                          }
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {profile?.role === 'patient' && appointment.doctor?.specialty 
                            ? appointment.doctor.specialty 
                            : appointment.appointment_type === 'virtual' 
                              ? 'Video Consultation' 
                              : 'In-person Visit'
                          }
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatDate(appointment.appointment_date)}</p>
                        <p className="text-sm text-muted-foreground">{appointment.time_slot}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                      <span 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${appointment.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                          }`
                        }
                      >
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                      <Link 
                        href={`/appointments/${appointment.id}`} 
                        className="text-sm text-primary hover:underline"
                      >
                        View details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Payment History Section (for patients only) */}
          {profile?.role === 'patient' && (
            <PaymentSummary 
              payments={payments} 
              appointmentDetails={appointmentDetails}
              className="mb-6" 
            />
          )}
          
          {/* Recent messages */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Messages</h2>
          <Link 
                href="/dashboard/messages" 
            className="text-sm text-primary hover:underline"
          >
            View all
          </Link>
        </div>
        
            {isMessagesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading messages...</p>
              </div>
            ) : unreadMessages.length === 0 ? (
              <div className="text-center py-8 border rounded-lg">
                <p className="text-muted-foreground">No unread messages</p>
              </div>
            ) : (
        <div className="space-y-4">
                {unreadMessages.slice(0, 3).map((message) => (
                  <div key={message.id} className="p-4 bg-[var(--card)] text-[var(--card-foreground)] rounded-[var(--radius)]">
                    <div className="flex items-center gap-3 mb-3">
                  <div className="bg-primary/10 text-primary p-2 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div>
                        <h3 className="font-medium">{message.sender?.full_name || 'User'}</h3>
                        <p className="text-xs text-muted-foreground">
                          {new Date(message.created_at).toLocaleString()}
                        </p>
                  </div>
                </div>
                    <p className="text-sm mb-3 line-clamp-2">{message.content}</p>
                    <Link 
                      href={`/dashboard/messages/${message.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      Read message →
                    </Link>
                  </div>
                ))}
              </div>
            )}
                  </div>
                  
          {/* Health records section for patients */}
          {profile?.role === 'patient' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Prescriptions</h2>
                <Link 
                  href="/dashboard/health-records" 
                  className="text-sm text-primary hover:underline"
                >
                  View all records
                </Link>
                  </div>
                  
              {healthRecordsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading health records...</p>
                </div>
              ) : healthRecordsError ? (
                <div className="text-center py-8 text-red-500">
                  <p>Error loading health records. Please try again later.</p>
                </div>
              ) : activePrescriptions.length === 0 ? (
                <div className="text-center py-8 border rounded-lg">
                  <p className="text-muted-foreground">No active prescriptions</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activePrescriptions.slice(0, 3).map((prescription) => (
                    <div key={prescription.id} className="p-4 bg-[var(--card)] text-[var(--card-foreground)] rounded-[var(--radius)]">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-primary/10 text-primary p-2 rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                  </div>
                        <div>
                          <h3 className="font-medium">{
                            // Display medication information from the medications JSON field
                            typeof prescription.medications === 'object' && prescription.medications !== null
                              ? Array.isArray(prescription.medications)
                                ? prescription.medications[0]?.name || 'Medication'
                                : 'Medication'
                              : 'Medication'
                          }</h3>
                          <p className="text-xs text-muted-foreground">
                            Prescribed on {new Date(prescription.issue_date).toLocaleDateString()}
                          </p>
                </div>
              </div>
                      <p className="text-sm mb-1">
                        <span className="font-medium">Dosage:</span> {
                          typeof prescription.medications === 'object' && prescription.medications !== null
                            ? Array.isArray(prescription.medications)
                              ? prescription.medications[0]?.dosage || 'As directed'
                              : 'As directed'
                            : 'As directed'
                        }
                      </p>
                      <p className="text-sm mb-3">
                        <span className="font-medium">Instructions:</span> {prescription.instructions || 'Follow doctor\'s instructions'}
                      </p>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">
                          {prescription.expiry_date ? (
                            <>Expires: {new Date(prescription.expiry_date).toLocaleDateString()}</>
                          ) : (
                            <>No expiration date</>
                          )}
                        </span>
                <Link
                          href={`/dashboard/health-records/prescriptions/${prescription.id}`}
                          className="text-primary hover:underline"
                >
                          View details →
                </Link>
              </div>
            </div>
          ))}
                </div>
              )}
            </div>
          )}
      </div>
      
        {/* Right column - Recent messages */}
        <div className="lg:col-span-1 space-y-6">
          {/* Recent messages */}
          <div className="bg-[var(--card)] text-[var(--card-foreground)] rounded-[var(--radius)] border border-[var(--border)] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[var(--border)]">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Recent Messages</h2>
                <Link href="/dashboard/messages" className="text-sm text-primary hover:underline">
              View all
            </Link>
              </div>
            </div>
            
            {isMessagesLoading ? (
              <div className="p-6 flex justify-center">
                <div className="h-10 w-10 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
              </div>
            ) : unreadMessages.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-muted-foreground">No unread messages</p>
          </div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {unreadMessages.slice(0, 5).map((message) => (
                  <div key={message.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start">
        <div>
                        <p className="font-medium">{message.sender?.full_name || 'User'}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(message.created_at).toLocaleString()}
                        </p>
          </div>
                      <div className="text-right">
                  <Link 
                    href={`/dashboard/messages/${message.id}`} 
                    className="text-sm text-primary hover:underline"
                  >
                          Read message →
                  </Link>
                      </div>
                </div>
              </div>
            ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Doctor-specific cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        <DashboardCard
          title="Medical Records"
          icon={<FileText className="h-6 w-6" />}
          href="/doctor/medical-records"
          description="Access and manage patient records"
        />
        
        <DashboardCard
          title="Prescriptions"
          icon={<Clipboard className="h-6 w-6" />}
          href="/doctor/prescriptions"
          description="Create and manage prescriptions"
        />
        
        <DashboardCard
          title="Billing"
          icon={<DollarSign className="h-6 w-6" />}
          href="/doctor/billing"
          description="Manage invoices and payments"
        />
        
        <DashboardCard
          title="Profile Settings"
          icon={<Settings className="h-6 w-6" />}
          href="/doctor/profile"
          description="Update your professional profile"
        />
      </div>
    </div>
  );
} 