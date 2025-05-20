import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClientComponentClient } from '@/lib/supabase';
import { Appointment, User } from '@/types/supabase';
import { hasAccessToAppointments, logAppointmentAction } from '@/utils/clientSecurityUtils';

// Types
type AppointmentWithDoctor = Appointment & {
  doctor?: User;
};

type AppointmentWithPatient = Appointment & {
  patient?: User;
};

export type AppointmentType = Appointment | AppointmentWithDoctor | AppointmentWithPatient;

interface UseAppointmentsOptions {
  includeDoctor?: boolean;
  includePatient?: boolean;
}

/**
 * Fetches appointments with caching using React Query
 */
export function useAppointmentsQuery(
  userId: string,
  userType: 'patient' | 'doctor',
  options: UseAppointmentsOptions = {}
) {
  const supabase = createClientComponentClient();
  const queryClient = useQueryClient();
  
  // Unique query key for this user's appointments
  const queryKey = ['appointments', userId, userType, options.includeDoctor, options.includePatient];
  
  // The main query
  const {
    data: appointments = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey,
    queryFn: async () => {
      try {
        // Security check
        const canAccess = await hasAccessToAppointments(userId, userType);
        if (!canAccess) {
          throw new Error('You do not have permission to access these appointments.');
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
          throw appointmentsError;
        }

        let enrichedAppointments = appointmentsData || [];

        // Fetch additional user data if requested
        if (options.includeDoctor && userType === 'patient') {
          const doctorIds = [...new Set(enrichedAppointments.map(a => a.doctor_id))];
          
          const { data: doctors } = await supabase
            .from('users')
            .select('*')
            .in('id', doctorIds);
          
          enrichedAppointments = enrichedAppointments.map(appointment => {
            const doctor = doctors?.find(d => d.id === appointment.doctor_id);
            return { ...appointment, doctor };
          });
        }

        if (options.includePatient && userType === 'doctor') {
          const patientIds = [...new Set(enrichedAppointments.map(a => a.patient_id))];
          
          const { data: patients } = await supabase
            .from('users')
            .select('*')
            .in('id', patientIds);
          
          enrichedAppointments = enrichedAppointments.map(appointment => {
            const patient = patients?.find(p => p.id === appointment.patient_id);
            return { ...appointment, patient };
          });
        }

        return enrichedAppointments as AppointmentType[];
      } catch (err) {
        console.error('Error in useAppointmentsQuery:', err);
        throw err;
      }
    },
    // Let the global config handle the cache settings
  });

  // Mutation for updating appointment status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ 
      appointmentId, 
      newStatus, 
      notes 
    }: { 
      appointmentId: string; 
      newStatus: Appointment['status']; 
      notes?: string; 
    }) => {
      // Security check
      const canAccess = await hasAccessToAppointments(userId, userType);
      if (!canAccess) {
        throw new Error('You do not have permission to update this appointment.');
      }

      const updates: Partial<Appointment> = { status: newStatus };
      if (notes) updates.notes = notes;

      // Try with normal client first
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

      // Log the action for audit
      let action: 'book' | 'reschedule' | 'cancel' | 'complete';
      
      switch (newStatus) {
        case 'confirmed': action = 'book'; break;
        case 'cancelled': action = 'cancel'; break;
        case 'completed': action = 'complete'; break;
        default: action = 'reschedule';
      }
      
      await logAppointmentAction(appointmentId, action);
      
      return appointmentId;
    },
    onSuccess: () => {
      // Invalidate and refetch appointments after successful update
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateAppointmentStatus = async (
    appointmentId: string, 
    newStatus: Appointment['status'],
    notes?: string
  ) => {
    try {
      await updateStatusMutation.mutateAsync({ appointmentId, newStatus, notes });
      return true;
    } catch (err) {
      console.error('Error updating appointment status:', err);
      return false;
    }
  };

  return {
    appointments,
    loading: isLoading,
    error: error ? (error as Error).message : null,
    refreshData: refetch,
    updateAppointmentStatus,
    isUpdating: updateStatusMutation.isPending
  };
} 