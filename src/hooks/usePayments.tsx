import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@/lib/supabase';
import { useAuth } from './useAuth';

interface Payment {
  id: string;
  appointment_id: string;
  amount: number;
  transaction_id: string;
  status: 'pending' | 'successful' | 'failed';
  payment_date: string;
}

interface AppointmentDetails {
  doctor_name?: string;
  doctor_id?: string;
  date?: string;
  time_slot?: string;
  consultation_type?: string;
}

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [appointmentDetails, setAppointmentDetails] = useState<Record<string, AppointmentDetails>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    async function fetchPayments() {
      setIsLoading(true);
      setError(null);

      try {
        // First get all appointments for the user
        const { data: appointments, error: appointmentsError } = await supabase
          .from('appointments')
          .select('id, doctor_id, date, time_slot, consultation_type')
          .eq('patient_id', user.id);

        if (appointmentsError) {
          throw appointmentsError;
        }

        // Build a mapping of appointment IDs to details
        const appointmentIds = appointments.map(app => app.id);
        const appointmentMap: Record<string, AppointmentDetails> = {};
        
        for (const appointment of appointments) {
          appointmentMap[appointment.id] = {
            doctor_id: appointment.doctor_id,
            date: appointment.date,
            time_slot: appointment.time_slot,
            consultation_type: appointment.consultation_type
          };
        }

        // Fetch doctor names for these appointments
        const doctorIds = appointments.map(app => app.doctor_id).filter(Boolean);
        
        if (doctorIds.length > 0) {
          const { data: doctors, error: doctorsError } = await supabase
            .from('users')
            .select('id, full_name')
            .in('id', doctorIds);

          if (doctorsError) {
            console.error('Error fetching doctors:', doctorsError);
          } else if (doctors) {
            // Add doctor names to appointment details
            for (const doctor of doctors) {
              // Find all appointments with this doctor
              for (const appId in appointmentMap) {
                if (appointmentMap[appId].doctor_id === doctor.id) {
                  appointmentMap[appId].doctor_name = doctor.full_name;
                }
              }
            }
          }
        }

        setAppointmentDetails(appointmentMap);

        // Now fetch payments for these appointments
        if (appointmentIds.length > 0) {
          const { data: paymentsData, error: paymentsError } = await supabase
            .from('payments')
            .select('*')
            .in('appointment_id', appointmentIds);

          if (paymentsError) {
            throw paymentsError;
          }

          setPayments(paymentsData || []);
        } else {
          setPayments([]);
        }
      } catch (err) {
        console.error('Error fetching payments:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchPayments();
  }, [supabase, user]);

  const retryPayment = async (appointmentId: string) => {
    try {
      // Get appointment details
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', appointmentId)
        .single();

      if (appointmentError) throw appointmentError;

      if (!appointmentData) {
        throw new Error('Appointment not found');
      }

      // Get doctor details to calculate price
      const { data: doctorData, error: doctorError } = await supabase
        .from('users')
        .select('consultation_fee')
        .eq('id', appointmentData.doctor_id)
        .single();

      if (doctorError) throw doctorError;

      // Calculate the appointment amount
      const amount = doctorData?.consultation_fee || 150;

      // Create Stripe checkout session
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId,
          amount,
          successUrl: `${window.location.origin}/payments?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/payments?canceled=true`,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Payment API error (${response.status}): ${errorText}`);
      }

      const result = await response.json();

      if (!result.url) {
        throw new Error('No redirect URL returned from payment service');
      }

      // Redirect to Stripe checkout
      window.location.href = result.url;
      return true;
    } catch (err) {
      console.error('Error retrying payment:', err);
      throw err;
    }
  };

  return {
    payments,
    appointmentDetails,
    isLoading,
    error,
    retryPayment
  };
} 