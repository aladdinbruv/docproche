import { useState, useCallback } from 'react';
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

export function usePrescriptions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, profile } = useAuth();
  const supabase = createClientComponentClient();

  // Fetch all prescriptions for the current doctor
  const fetchPrescriptions = useCallback(async () => {
    if (!user || !profile || profile.role !== 'doctor') {
      setError('Unauthorized: Only doctors can access prescriptions');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/prescriptions');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch prescriptions');
      }
      
      const data = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching prescriptions');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, profile]);

  // Fetch prescriptions for a specific patient
  const fetchPatientPrescriptions = useCallback(async (patientId: string) => {
    if (!user || !profile || profile.role !== 'doctor') {
      setError('Unauthorized: Only doctors can access prescriptions');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/prescriptions?patient_id=${patientId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch patient prescriptions');
      }
      
      const data = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching patient prescriptions');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, profile]);

  // Create a new prescription
  const createPrescription = useCallback(async (prescriptionData: CreatePrescriptionData) => {
    if (!user || !profile || profile.role !== 'doctor') {
      setError('Unauthorized: Only doctors can create prescriptions');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
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
      return data;
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the prescription');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, profile]);

  // Update an existing prescription
  const updatePrescription = useCallback(async (id: string, updateData: UpdatePrescriptionData) => {
    if (!user || !profile || profile.role !== 'doctor') {
      setError('Unauthorized: Only doctors can update prescriptions');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
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
      return data;
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating the prescription');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, profile]);

  // Deactivate a prescription (soft delete)
  const deactivatePrescription = useCallback(async (id: string) => {
    if (!user || !profile || profile.role !== 'doctor') {
      setError('Unauthorized: Only doctors can deactivate prescriptions');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/prescriptions?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to deactivate prescription');
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message || 'An error occurred while deactivating the prescription');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, profile]);

  // Check if a prescription is expired
  const isPrescriptionExpired = useCallback((prescription: Prescription) => {
    if (!prescription.expiry_date) return false;
    return new Date(prescription.expiry_date) < new Date();
  }, []);

  return {
    loading,
    error,
    fetchPrescriptions,
    fetchPatientPrescriptions,
    createPrescription,
    updatePrescription,
    deactivatePrescription,
    isPrescriptionExpired,
  };
} 