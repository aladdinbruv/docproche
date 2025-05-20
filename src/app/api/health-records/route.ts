import { NextRequest, NextResponse } from 'next/server';
import { getServerComponentClient } from '@/lib/server-supabase';
import { getHealthRecord, getPatientHealthRecords, logDataAccess } from '@/utils/securityUtils';

/**
 * GET /api/health-records?patientId=xyz
 * Securely fetches all health records for a patient
 * Uses database RLS and server functions
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const patientId = searchParams.get('patientId');
    const recordId = searchParams.get('recordId');
    
    if (!patientId && !recordId) {
      return NextResponse.json(
        { error: 'Either patientId or recordId is required' },
        { status: 400 }
      );
    }

    // Create a Supabase client with the user's session
    const supabase = getServerComponentClient();
    
    // Verify the user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // If recordId is provided, get a single record
    if (recordId) {
      const record = await getHealthRecord(recordId);
      
      if (!record) {
        return NextResponse.json(
          { error: 'Health record not found or access denied' },
          { status: 404 }
        );
      }
      
      // Log the access
      await logDataAccess('health_record', recordId, 'view');
      
      return NextResponse.json({ record });
    }
    
    // Otherwise get all records for the patient
    const records = await getPatientHealthRecords(patientId!);
    
    // If the function returns empty array, it could be no records or no access
    // But we don't tell the client which one for security reasons
    return NextResponse.json({ records });
    
  } catch (error) {
    console.error('Error in health records API:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching health records' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/health-records
 * Securely creates a new health record
 * Uses database RLS
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getServerComponentClient();
    
    // Verify the user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get the request body
    const body = await request.json();
    
    // The RLS policies will handle access control
    // Doctor can only create health records for patients they have appointments with
    const { data, error } = await supabase
      .from('health_records')
      .insert(body)
      .select()
      .single();
      
    if (error) {
      // Check if it's a permission error
      if (error.code === '42501') {
        return NextResponse.json(
          { error: 'Permission denied to create health record' },
          { status: 403 }
        );
      }
      
      console.error('Error creating health record:', error);
      return NextResponse.json(
        { error: 'Failed to create health record' },
        { status: 500 }
      );
    }
    
    // Log the creation of the record
    await logDataAccess('health_record', data.id, 'create');
    
    return NextResponse.json({ record: data });
    
  } catch (error) {
    console.error('Error in health records API:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating health record' },
      { status: 500 }
    );
  }
} 