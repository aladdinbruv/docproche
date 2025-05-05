import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@/lib/supabase';
import { Appointment, User } from '@/types/supabase';
import { hasAccessToAppointments, logAppointmentAction } from '@/utils/securityUtils';

// Remove the direct supabaseAdmin client creation from client-side code
// The service role key is not available in the browser

type AppointmentWithDoctor = Appointment & {
  doctor?: User;
};

type AppointmentWithPatient = Appointment & {
  patient?: User;
};

interface UseAppointmentsOptions {
  includeDoctor?: boolean;
  includePatient?: boolean;
}

/**
 * Custom hook for securely accessing appointments
 * Includes access control, audit logging, and error handling
 */
export function useAppointments(
  userId: string, 
  userType: 'patient' | 'doctor',
  options: UseAppointmentsOptions = {}
) {
  const [appointments, setAppointments] = useState<(Appointment | AppointmentWithDoctor | AppointmentWithPatient)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);

  const supabase = createClientComponentClient();

  useEffect(() => {
    async function checkAccess() {
      const hasAccess = await hasAccessToAppointments(userId, userType);
      setHasAccess(hasAccess);
      return hasAccess;
    }

    async function fetchAppointments() {
      setLoading(true);
      setError(null);

      try {
        // Check access first
        const canAccess = await checkAccess();
        if (!canAccess) {
          setError('You do not have permission to access these appointments.');
          setLoading(false);
          return;
        }

        // Use the secure RPC function for appointments
        const rpcFunction = userType === 'patient' 
          ? 'get_patient_appointments' 
          : 'get_doctor_appointments';
        
        const rpcParam = userType === 'patient' 
          ? { patient_id: userId } 
          : { doctor_id: userId };

        const { data: appointmentsData, error: appointmentsError } = await supabase
          .rpc(rpcFunction, rpcParam);

        if (appointmentsError) {
          console.error(`Error fetching ${userType} appointments:`, appointmentsError);
          setError(`Failed to load appointments.`);
          setLoading(false);
          return;
        }

        let enrichedAppointments = appointmentsData || [];

        // Fetch additional user data if requested
        if (options.includeDoctor && userType === 'patient') {
          // Get all unique doctor IDs
          const doctorIds = [...new Set(enrichedAppointments.map(a => a.doctor_id))];
          
          // Fetch doctor data
          const { data: doctors } = await supabase
            .from('users')
            .select('*')
            .in('id', doctorIds);
          
          // Merge doctor data with appointments
          enrichedAppointments = enrichedAppointments.map(appointment => {
            const doctor = doctors?.find(d => d.id === appointment.doctor_id);
            return { ...appointment, doctor };
          });
        }

        if (options.includePatient && userType === 'doctor') {
          // Get all unique patient IDs
          const patientIds = [...new Set(enrichedAppointments.map(a => a.patient_id))];
          
          // Fetch patient data
          const { data: patients } = await supabase
            .from('users')
            .select('*')
            .in('id', patientIds);
          
          // Merge patient data with appointments
          enrichedAppointments = enrichedAppointments.map(appointment => {
            const patient = patients?.find(p => p.id === appointment.patient_id);
            return { ...appointment, patient };
          });
        }

        setAppointments(enrichedAppointments);

      } catch (err) {
        console.error('Error in useAppointments:', err);
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    }

    fetchAppointments();
  }, [userId, userType, options.includeDoctor, options.includePatient]);

  const refreshData = async () => {
    setLoading(true);
    
    try {
      // Only refetch if user has access
      if (!hasAccess) {
        setError('You do not have permission to access these appointments.');
        return;
      }
      
      // Use the secure RPC function for appointments
      const rpcFunction = userType === 'patient' 
        ? 'get_patient_appointments' 
        : 'get_doctor_appointments';
      
      const rpcParam = userType === 'patient' 
        ? { patient_id: userId } 
        : { doctor_id: userId };

      const { data, error: appointmentsError } = await supabase
        .rpc(rpcFunction, rpcParam);

      if (appointmentsError) throw appointmentsError;
      setAppointments(data || []);
      setError(null);
    } catch (err) {
      console.error('Error refreshing appointments:', err);
      setError('Failed to refresh appointments.');
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (
    appointmentId: string, 
    newStatus: Appointment['status'],
    notes?: string
  ) => {
    if (!hasAccess) {
      setError('You do not have permission to update this appointment.');
      return false;
    }

    try {
      const updates: Partial<Appointment> = { status: newStatus };
      if (notes) updates.notes = notes;

      // Try with normal client first (should work for doctors and pending appointments for patients)
      let { error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', appointmentId);

      // If we get an error, try with the server API endpoint
      if (error) {
        const response = await fetch('/api/appointments/update-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            appointmentId,
            status: newStatus,
            notes
          }),
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to update appointment status');
        }
      }

      // Log the action for audit purposes
      let action: 'book' | 'reschedule' | 'cancel' | 'complete';
      
      switch (newStatus) {
        case 'confirmed':
          action = 'book';
          break;
        case 'cancelled':
          action = 'cancel';
          break;
        case 'completed':
          action = 'complete';
          break;
        default:
          action = 'reschedule';
      }
      
      await logAppointmentAction(appointmentId, action);
      
      // Refresh data
      await refreshData();
      return true;
    } catch (err) {
      console.error('Error updating appointment status:', err);
      setError('Failed to update appointment status.');
      return false;
    }
  };

  return {
    appointments,
    loading,
    error,
    hasAccess,
    refreshData,
    updateAppointmentStatus
  };
}