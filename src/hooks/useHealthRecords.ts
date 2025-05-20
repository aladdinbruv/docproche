import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@/lib/supabase';
import { HealthRecord, MedicalHistory, Prescription } from '@/types/supabase';
import { hasAccessToPatientRecords, logDataAccess } from '@/utils/clientSecurityUtils';

type CreateHealthRecordInput = {
  patient_id: string;
  appointment_id?: string;
  record_type: string;
  title: string;
  description?: string;
  file_url?: string;
};

/**
 * Custom hook for securely accessing a patient's health records
 * Includes access control, audit logging, and error handling
 */
export function useHealthRecords(patientId?: string) {
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);

  const supabase = createClientComponentClient();

  useEffect(() => {
    if (!patientId) {
      setLoading(false);
      return;
    }
    
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

        // Try using the secure RPC function with fallback to direct query
        let records: HealthRecord[] = [];

        // First attempt: Use the safe wrapper function which handles errors internally
        const { data: safeRecords, error: safeError } = await supabase
          .rpc('get_patient_health_records_safe', { p_patient_id: patientId });
          
        if (!safeError) {
          // Safe function worked
          records = safeRecords || [];
        } else {
          console.warn('Safe RPC function failed, trying standard RPC:', safeError);
          
          // Second attempt: Try the regular RPC function
          const { data: rpcRecords, error: rpcError } = await supabase
            .rpc('get_patient_health_records', { patient_id: patientId });
            
          if (rpcError) {
            console.warn('RPC function failed, falling back to direct query:', rpcError);
            
            // Final fallback: Direct query
            const { data: directRecords, error: directError } = await supabase
              .from('health_records')
              .select('*')
              .eq('patient_id', patientId)
              .order('created_at', { ascending: false });
            
            if (directError) {
              console.error('All health records fetch methods failed:', directError);
              throw directError;
            }
            
            records = directRecords || [];
          } else {
            records = rpcRecords || [];
          }
        }

        setHealthRecords(records);
        
        // Log the access for audit purposes
        if (records && records.length > 0) {
          await logDataAccess('health_record', patientId, 'view');
        }

        // Fetch medical history - try RPC first, then direct
        try {
          const { data: historyData, error: historyRpcError } = await supabase
            .rpc('get_patient_medical_history', { patient_id: patientId });
            
          if (historyRpcError) {
            // Fallback to direct query
            const { data: historyDirect, error: historyDirectError } = await supabase
              .from('medical_history')
              .select('*')
              .eq('patient_id', patientId)
              .order('diagnosed_date', { ascending: false });
              
            if (historyDirectError) throw historyDirectError;
            setMedicalHistory(historyDirect || []);
          } else {
            setMedicalHistory(historyData || []);
          }
        } catch (histErr) {
          console.error('Error fetching medical history:', histErr);
          // Continue with partial data
        }

        // Fetch prescriptions - try RPC first, then direct
        try {
          const { data: prescData, error: prescRpcError } = await supabase
            .rpc('get_patient_prescriptions', { patient_id: patientId });
            
          if (prescRpcError) {
            // Fallback to direct query
            const { data: prescDirect, error: prescDirectError } = await supabase
              .from('prescriptions')
              .select('*')
              .eq('patient_id', patientId)
              .order('issue_date', { ascending: false });
              
            if (prescDirectError) throw prescDirectError;
            setPrescriptions(prescDirect || []);
          } else {
            setPrescriptions(prescData || []);
          }
        } catch (prescErr) {
          console.error('Error fetching prescriptions:', prescErr);
          // Continue with partial data
        }

      } catch (err) {
        console.error('Error in useHealthRecords:', err);
        setError('An unexpected error occurred while fetching health data.');
      } finally {
        setLoading(false);
      }
    }

    fetchHealthData();
  }, [patientId]);

  const refreshData = async () => {
    if (!patientId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Only refetch if user has access
      if (!hasAccess) {
        setError('You do not have permission to access these health records.');
        return;
      }
      
      // Try using the secure RPC function with fallback to direct query
      let records: HealthRecord[] = [];

      // First attempt: Use the safe wrapper function which handles errors internally
      const { data: safeRecords, error: safeError } = await supabase
        .rpc('get_patient_health_records_safe', { p_patient_id: patientId });
        
      if (!safeError) {
        // Safe function worked
        records = safeRecords || [];
      } else {
        console.warn('Safe RPC function failed on refresh, trying standard RPC:', safeError);
        
        // Second attempt: Try the regular RPC function
        const { data: rpcRecords, error: rpcError } = await supabase
          .rpc('get_patient_health_records', { patient_id: patientId });
          
        if (rpcError) {
          console.warn('RPC function failed on refresh, falling back to direct query:', rpcError);
          
          // Final fallback: Direct query
          const { data: directRecords, error: directError } = await supabase
            .from('health_records')
            .select('*')
            .eq('patient_id', patientId)
            .order('created_at', { ascending: false });
          
          if (directError) {
            console.error('All health records fetch methods failed on refresh:', directError);
            throw directError;
          }
          
          records = directRecords || [];
        } else {
          records = rpcRecords || [];
        }
      }

      setHealthRecords(records);

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

  // Add health record creation functionality
  const createHealthRecord = async (recordData: CreateHealthRecordInput) => {
    try {
      // Check if the user has access to this patient's records if patientId is provided
      if (patientId && !hasAccess) {
        throw new Error('You do not have permission to create health records for this patient.');
      }

      // Get the current user to set as the doctor_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to create health records.');
      }

      // Insert the record
      const { data, error } = await supabase
        .from('health_records')
        .insert({
          ...recordData,
          doctor_id: user.id,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      
      // Log the creation for audit purposes
      await logDataAccess('health_record', recordData.patient_id, 'create');
      
      // Refresh the records if we're looking at the same patient
      if (patientId === recordData.patient_id) {
        await refreshData();
      }
      
      return data;
    } catch (err: any) {
      console.error('Error creating health record:', err);
      throw new Error(err.message || 'Failed to create health record');
    }
  };

  return {
    healthRecords,
    medicalHistory,
    prescriptions,
    loading,
    error,
    hasAccess,
    refreshData,
    createHealthRecord
  };
} 