import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClientComponentClient } from '@/lib/supabase';
import { useAuth } from './useAuth';

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
}

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
}

interface CreatePrescriptionData {
  patient_id: string;
  appointment_id?: string;
  medications: Medication[];
  instructions?: string;
  issue_date?: string;
  expiry_date?: string;
}

interface UpdatePrescriptionData {
  medications?: Medication[];
  instructions?: string;
  expiry_date?: string;
  is_active?: boolean;
}

export function usePrescriptionsQuery() {
  const { user, profile } = useAuth();
  const supabase = createClientComponentClient();
  const queryClient = useQueryClient();

  // Fetch all prescriptions for the current doctor
  const prescriptionsQuery = useQuery({
    queryKey: ['prescriptions', profile?.id],
    queryFn: async () => {
      if (!user || !profile || profile.role !== 'doctor') {
        throw new Error('Unauthorized: Only doctors can access prescriptions');
      }

      const response = await fetch('/api/prescriptions');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch prescriptions');
      }
      
      const data = await response.json();
      return data as Prescription[];
    },
    enabled: !!user && !!profile && profile.role === 'doctor',
  });

  // Fetch prescriptions for a specific patient
  const usePatientPrescriptions = (patientId?: string) => {
    return useQuery({
      queryKey: ['prescriptions', 'patient', patientId],
      queryFn: async () => {
        if (!patientId) throw new Error('Patient ID is required');
        if (!user || !profile || profile.role !== 'doctor') {
          throw new Error('Unauthorized: Only doctors can access prescriptions');
        }

        const response = await fetch(`/api/prescriptions?patient_id=${patientId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch patient prescriptions');
        }
        
        const data = await response.json();
        return data as Prescription[];
      },
      enabled: !!patientId && !!user && !!profile && profile.role === 'doctor',
    });
  };

  // Create a new prescription
  const createPrescriptionMutation = useMutation({
    mutationFn: async (prescriptionData: CreatePrescriptionData) => {
      if (!user || !profile || profile.role !== 'doctor') {
        throw new Error('Unauthorized: Only doctors can create prescriptions');
      }

      const response = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prescriptionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create prescription');
      }

      const data = await response.json();
      return data as Prescription;
    },
    onSuccess: () => {
      // Invalidate prescriptions queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    },
  });

  // Update an existing prescription
  const updatePrescriptionMutation = useMutation({
    mutationFn: async ({ id, updateData }: { id: string; updateData: UpdatePrescriptionData }) => {
      if (!user || !profile || profile.role !== 'doctor') {
        throw new Error('Unauthorized: Only doctors can update prescriptions');
      }

      const response = await fetch(`/api/prescriptions?id=${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update prescription');
      }

      const data = await response.json();
      return data as Prescription;
    },
    onSuccess: (data) => {
      // Invalidate specific prescription and all prescriptions
      queryClient.invalidateQueries({ queryKey: ['prescriptions', 'patient', data.patient_id] });
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    },
  });

  // Deactivate a prescription (soft delete)
  const deactivatePrescriptionMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user || !profile || profile.role !== 'doctor') {
        throw new Error('Unauthorized: Only doctors can deactivate prescriptions');
      }

      const response = await fetch(`/api/prescriptions?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to deactivate prescription');
      }

      const data = await response.json();
      return data as Prescription;
    },
    onSuccess: (data) => {
      // Invalidate specific prescription and all prescriptions
      queryClient.invalidateQueries({ queryKey: ['prescriptions', 'patient', data.patient_id] });
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    },
  });

  // Check if a prescription is expired
  const isPrescriptionExpired = (prescription: Prescription) => {
    if (!prescription.expiry_date) return false;
    return new Date(prescription.expiry_date) < new Date();
  };

  return {
    prescriptions: prescriptionsQuery.data || [],
    loading: prescriptionsQuery.isLoading,
    error: prescriptionsQuery.error 
      ? (prescriptionsQuery.error as Error).message 
      : null,
    usePatientPrescriptions,
    createPrescription: createPrescriptionMutation.mutateAsync,
    updatePrescription: updatePrescriptionMutation.mutateAsync,
    deactivatePrescription: deactivatePrescriptionMutation.mutateAsync,
    isPrescriptionExpired,
    isCreating: createPrescriptionMutation.isPending,
    isUpdating: updatePrescriptionMutation.isPending,
    isDeactivating: deactivatePrescriptionMutation.isPending,
  };
} 