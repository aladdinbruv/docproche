import { createServerComponentClient } from '@/lib/supabase';
import { HealthRecord, Appointment } from '@/types/supabase';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// CLIENT-SIDE SECURITY UTILITIES
// These functions will be used in client components

/**
 * Client-side function to check if user has access to appointments
 * Used for client-side access control
 */
export async function hasAccessToAppointments(userId: string, userType: 'patient' | 'doctor'): Promise<boolean> {
  try {
    const supabase = createClientComponentClient();
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;
    
    const currentUserId = user.id;
    
    // User is accessing their own appointments
    if (currentUserId === userId) return true;
    
    // Check if user is an admin
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', currentUserId)
      .single();
    
    if (userError) {
      console.error('Error checking user role:', userError);
      return false;
    }
    
    return userProfile?.role === 'admin';
    
  } catch (error) {
    console.error('Error in hasAccessToAppointments:', error);
    return false;
  }
}

/**
 * Client-side function to log appointment actions
 */
export async function logAppointmentAction(
  appointmentId: string,
  action: 'book' | 'reschedule' | 'cancel' | 'complete'
): Promise<void> {
  try {
    const supabase = createClientComponentClient();
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;
    
    const userId = user.id;
    
    // Call the server API to log the action
    await fetch('/api/audit/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resourceType: 'appointment',
        resourceId: appointmentId,
        action,
        userId
      }),
    });
    
  } catch (error) {
    console.error('Error in logAppointmentAction:', error);
  }
}

/**
 * Checks if the current user has access to a patient's health records
 * Used for client-side access control
 */
export async function hasAccessToPatientRecords(patientId: string): Promise<boolean> {
  try {
    const supabase = createClientComponentClient();
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;
    
    const userId = user.id;
    
    // User is the patient - automatically grant access
    if (userId === patientId) return true;
    
    // Check if user is a doctor with appointments for this patient
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('id')
      .eq('doctor_id', userId)
      .eq('patient_id', patientId)
      .limit(1);
    
    if (appointmentsError) {
      console.error('Error checking doctor-patient relationship:', appointmentsError);
      return false;
    }
    
    // Doctor has at least one appointment with the patient
    if (appointments && appointments.length > 0) return true;
    
    // Check if user is an admin
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (userError) {
      console.error('Error checking user role:', userError);
      return false;
    }
    
    return userProfile?.role === 'admin';
    
  } catch (error) {
    console.error('Error in hasAccessToPatientRecords:', error);
    return false;
  }
}

// SERVER-SIDE SECURITY UTILITIES
// These functions will only be used in server components or API routes

/**
 * Securely retrieves a health record using the database function
 * This ensures access tracking and proper authorization
 * SERVER-SIDE ONLY
 */
export async function getHealthRecord(recordId: string) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ 
    cookies: () => cookieStore 
  });
  
  try {
    const { data, error } = await supabase
      .rpc('get_health_record', { record_id: recordId });
    
    if (error) {
      console.error('Error fetching health record:', error);
      return null;
    }
    
    return data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error in getHealthRecord:', error);
    return null;
  }
}

/**
 * Securely retrieves all health records for a patient
 * Ensures access tracking and proper authorization
 * SERVER-SIDE ONLY
 */
export async function getPatientHealthRecords(patientId: string) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ 
    cookies: () => cookieStore 
  });
  
  try {
    const { data, error } = await supabase
      .rpc('get_patient_health_records', { patient_id: patientId });
    
    if (error) {
      console.error('Error fetching patient health records:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getPatientHealthRecords:', error);
    return [];
  }
}

/**
 * Helper function to encrypt PHI before storing it
 * SERVER-SIDE ONLY
 */
export async function encryptPHI(data: string) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ 
    cookies: () => cookieStore 
  });
  
  try {
    const { data: encryptedData, error } = await supabase
      .rpc('encrypt_phi', { data });
    
    if (error) {
      console.error('Error encrypting PHI:', error);
      return null;
    }
    
    return encryptedData;
  } catch (error) {
    console.error('Error in encryptPHI:', error);
    return null;
  }
}

/**
 * Helper function to decrypt PHI when retrieving it
 * SERVER-SIDE ONLY
 */
export async function decryptPHI(encryptedData: string) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ 
    cookies: () => cookieStore 
  });
  
  try {
    const { data: decryptedData, error } = await supabase
      .rpc('decrypt_phi', { encrypted_data: encryptedData });
    
    if (error) {
      console.error('Error decrypting PHI:', error);
      return null;
    }
    
    return decryptedData;
  } catch (error) {
    console.error('Error in decryptPHI:', error);
    return null;
  }
}

/**
 * Records an audit log entry for sensitive data access
 * SERVER-SIDE ONLY
 */
export async function logDataAccess(
  recordType: 'health_record' | 'medical_history' | 'prescription',
  recordId: string,
  action: 'view' | 'edit' | 'create' | 'delete'
) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ 
    cookies: () => cookieStore 
  });
  
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;
    
    const userId = user.id;
    
    // If it's a health record, use the built-in tracking function
    if (recordType === 'health_record') {
      await supabase.rpc('track_health_record_access', { record_id: recordId });
      return;
    }
    
    // For other types, we would create an audit log table entry if you had one
    // This is a placeholder for future implementation
    console.log(`Logged ${action} access to ${recordType} ${recordId} by user ${userId}`);
    
  } catch (error) {
    console.error('Error in logDataAccess:', error);
  }
}

/**
 * Securely retrieves all appointments for a patient
 * Ensures proper authorization
 * SERVER-SIDE ONLY
 */
export async function getPatientAppointments(patientId: string) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ 
    cookies: () => cookieStore 
  });
  
  try {
    const { data, error } = await supabase
      .rpc('get_patient_appointments', { patient_id: patientId });
    
    if (error) {
      console.error('Error fetching patient appointments:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getPatientAppointments:', error);
    return [];
  }
}

/**
 * Securely retrieves all appointments for a doctor
 * Ensures proper authorization
 * SERVER-SIDE ONLY
 */
export async function getDoctorAppointments(doctorId: string) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ 
    cookies: () => cookieStore 
  });
  
  try {
    const { data, error } = await supabase
      .rpc('get_doctor_appointments', { doctor_id: doctorId });
    
    if (error) {
      console.error('Error fetching doctor appointments:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getDoctorAppointments:', error);
    return [];
  }
}