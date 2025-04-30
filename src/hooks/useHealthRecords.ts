import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@/lib/supabase';
import { HealthRecord, MedicalHistory, Prescription } from '@/types/supabase';
import { hasAccessToPatientRecords, logDataAccess } from '@/utils/securityUtils';

/**
 * Custom hook for securely accessing a patient's health records
 * Includes access control, audit logging, and error handling
 */
export function useHealthRecords(patientId: string) {
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);

  const supabase = createClientComponentClient();

  useEffect(() => {
    async function checkAccess() {
      const hasAccess = await hasAccessToPatientRecords(patientId);
      setHasAccess(hasAccess);
      return hasAccess;
    }

    async function fetchHealthData() {
      setLoading(true);
      setError(null);

      try {
        // Check access first
        const canAccess = await checkAccess();
        if (!canAccess) {
          setError('You do not have permission to access these health records.');
          setLoading(false);
          return;
        }

        // Use the secure RPC function for health records
        const { data: records, error: recordsError } = await supabase
          .rpc('get_patient_health_records', { patient_id: patientId });

        if (recordsError) {
          console.error('Error fetching health records:', recordsError);
          setError('Failed to load health records.');
          setLoading(false);
          return;
        }

        setHealthRecords(records || []);
        
        // Log the access for audit purposes
        if (records && records.length > 0) {
          await logDataAccess('health_record', patientId, 'view');
        }

        // Fetch medical history
        const { data: history, error: historyError } = await supabase
          .from('medical_history')
          .select('*')
          .eq('patient_id', patientId)
          .order('diagnosed_date', { ascending: false });

        if (historyError) {
          console.error('Error fetching medical history:', historyError);
          // Continue with partial data
        } else {
          setMedicalHistory(history || []);
        }

        // Fetch prescriptions
        const { data: scripts, error: scriptsError } = await supabase
          .from('prescriptions')
          .select('*')
          .eq('patient_id', patientId)
          .order('issue_date', { ascending: false });

        if (scriptsError) {
          console.error('Error fetching prescriptions:', scriptsError);
          // Continue with partial data
        } else {
          setPrescriptions(scripts || []);
        }

      } catch (err) {
        console.error('Error in useHealthRecords:', err);
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    }

    fetchHealthData();
  }, [patientId]);

  const refreshData = async () => {
    setLoading(true);
    
    try {
      // Only refetch if user has access
      if (!hasAccess) {
        setError('You do not have permission to access these health records.');
        return;
      }
      
      // Use the secure RPC function for health records
      const { data: records, error: recordsError } = await supabase
        .rpc('get_patient_health_records', { patient_id: patientId });

      if (recordsError) throw recordsError;
      setHealthRecords(records || []);

      // Fetch medical history
      const { data: history, error: historyError } = await supabase
        .from('medical_history')
        .select('*')
        .eq('patient_id', patientId)
        .order('diagnosed_date', { ascending: false });

      if (historyError) throw historyError;
      setMedicalHistory(history || []);

      // Fetch prescriptions
      const { data: scripts, error: scriptsError } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('patient_id', patientId)
        .order('issue_date', { ascending: false });

      if (scriptsError) throw scriptsError;
      setPrescriptions(scripts || []);
      
      setError(null);
    } catch (err) {
      console.error('Error refreshing health data:', err);
      setError('Failed to refresh health data.');
    } finally {
      setLoading(false);
    }
  };

  return {
    healthRecords,
    medicalHistory,
    prescriptions,
    loading,
    error,
    hasAccess,
    refreshData
  };
} 