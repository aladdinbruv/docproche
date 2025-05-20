import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

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

/**
 * Checks if the current user has access to appointments
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
 * Records an audit log entry for appointment actions
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
 * Client-side version of logDataAccess
 * Records an audit log entry for sensitive data access
 */
export async function logDataAccess(
  recordType: 'health_record' | 'medical_history' | 'prescription',
  recordId: string,
  action: 'view' | 'edit' | 'create' | 'delete'
): Promise<void> {
  try {
    const supabase = createClientComponentClient();
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;
    
    // Call the server API endpoint to log this access
    await fetch('/api/audit/log-data-access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recordType,
        recordId,
        action,
        userId: user.id
      }),
    });
    
  } catch (error) {
    console.error('Error in logDataAccess:', error);
  }
}

/**
 * Client-side helper function to encrypt PHI before storing it
 */
export async function encryptPHI(data: string): Promise<string | null> {
  try {
    const supabase = createClientComponentClient();
    
    // Call the database function to encrypt the data
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