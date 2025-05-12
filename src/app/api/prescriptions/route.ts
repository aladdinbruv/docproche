import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET all prescriptions for the authenticated doctor
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get('patient_id');
  
  const supabase = createRouteHandlerClient({ cookies });
  
  // Check authentication
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Get user profile to check if doctor
  const { data: userProfile } = await supabase
    .from('users')
    .select('role, id')
    .eq('id', session.user.id)
    .single();
    
  if (!userProfile || userProfile.role !== 'doctor') {
    return NextResponse.json({ error: 'Only doctors can access prescriptions' }, { status: 403 });
  }
  
  // Base query
  let query = supabase
    .from('prescriptions')
    .select(`
      *,
      patient:patient_id(id, full_name, email),
      appointment:appointment_id(date, time_slot, consultation_type)
    `);
  
  // Apply filters
  if (patientId) {
    query = query.eq('patient_id', patientId);
  } else {
    // Default to show only the doctor's prescriptions
    query = query.eq('doctor_id', userProfile.id);
  }
  
  // Execute query
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}

// POST to create a new prescription
export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  // Check authentication
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Get user profile to check if doctor
  const { data: userProfile } = await supabase
    .from('users')
    .select('role, id')
    .eq('id', session.user.id)
    .single();
    
  if (!userProfile || userProfile.role !== 'doctor') {
    return NextResponse.json({ error: 'Only doctors can create prescriptions' }, { status: 403 });
  }
  
  try {
    const { 
      patient_id, 
      appointment_id, 
      medications, 
      instructions, 
      issue_date, 
      expiry_date 
    } = await request.json();
    
    // Validation
    if (!patient_id || !medications || !Array.isArray(medications) || medications.length === 0) {
      return NextResponse.json(
        { error: 'Patient ID and at least one medication are required' }, 
        { status: 400 }
      );
    }
    
    // Each medication should have name, dosage, and frequency
    const isValidMedications = medications.every(
      med => med.name && med.dosage && med.frequency
    );
    
    if (!isValidMedications) {
      return NextResponse.json(
        { error: 'Each medication must have name, dosage, and frequency' }, 
        { status: 400 }
      );
    }
    
    // Create the prescription
    const { data, error } = await supabase
      .from('prescriptions')
      .insert({
        patient_id,
        doctor_id: userProfile.id,
        appointment_id: appointment_id || null,
        medications,
        instructions: instructions || null,
        issue_date: issue_date || new Date().toISOString().split('T')[0],
        expiry_date: expiry_date || null,
        is_active: true
      })
      .select();
      
    if (error) {
      throw error;
    }
    
    // Create a notification for the patient
    await supabase
      .from('notifications')
      .insert({
        user_id: patient_id,
        title: 'New Prescription',
        message: 'Your doctor has prescribed new medication for you',
        type: 'system',
        related_id: data[0].id
      });
    
    return NextResponse.json(data[0], { status: 201 });
  } catch (error: any) {
    console.error('Error creating prescription:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH to update a prescription
export async function PATCH(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'Prescription ID is required' }, { status: 400 });
  }
  
  // Check authentication
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Get user profile to check if doctor
  const { data: userProfile } = await supabase
    .from('users')
    .select('role, id')
    .eq('id', session.user.id)
    .single();
    
  if (!userProfile || userProfile.role !== 'doctor') {
    return NextResponse.json({ error: 'Only doctors can update prescriptions' }, { status: 403 });
  }
  
  try {
    const updateData = await request.json();
    
    // Check if this doctor owns the prescription
    const { data: prescriptionCheck } = await supabase
      .from('prescriptions')
      .select('doctor_id')
      .eq('id', id)
      .single();
      
    if (!prescriptionCheck || prescriptionCheck.doctor_id !== userProfile.id) {
      return NextResponse.json(
        { error: 'You can only update your own prescriptions' }, 
        { status: 403 }
      );
    }
    
    // Update the prescription
    const { data, error } = await supabase
      .from('prescriptions')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
      
    if (error) {
      throw error;
    }
    
    return NextResponse.json(data[0]);
  } catch (error: any) {
    console.error('Error updating prescription:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE to deactivate a prescription
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'Prescription ID is required' }, { status: 400 });
  }
  
  const supabase = createRouteHandlerClient({ cookies });
  
  // Check authentication
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Get user profile to check if doctor
  const { data: userProfile } = await supabase
    .from('users')
    .select('role, id')
    .eq('id', session.user.id)
    .single();
    
  if (!userProfile || userProfile.role !== 'doctor') {
    return NextResponse.json({ error: 'Only doctors can deactivate prescriptions' }, { status: 403 });
  }
  
  try {
    // Check if this doctor owns the prescription
    const { data: prescriptionCheck } = await supabase
      .from('prescriptions')
      .select('doctor_id')
      .eq('id', id)
      .single();
      
    if (!prescriptionCheck || prescriptionCheck.doctor_id !== userProfile.id) {
      return NextResponse.json(
        { error: 'You can only deactivate your own prescriptions' }, 
        { status: 403 }
      );
    }
    
    // We don't actually delete prescriptions for audit purposes
    // Instead we set is_active to false
    const { data, error } = await supabase
      .from('prescriptions')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
      
    if (error) {
      throw error;
    }
    
    return NextResponse.json(data[0]);
  } catch (error: any) {
    console.error('Error deactivating prescription:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 