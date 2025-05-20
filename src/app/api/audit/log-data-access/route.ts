import { NextRequest, NextResponse } from 'next/server';
import { getServerComponentClient } from '@/lib/server-supabase';

/**
 * POST /api/audit/log-data-access
 * Endpoint for logging data access events from client components
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
    const { recordType, recordId, action, userId } = body;
    
    // Basic validation
    if (!recordType || !recordId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Verify the user matches (security check)
    if (userId !== user.id) {
      return NextResponse.json(
        { error: 'User ID mismatch' },
        { status: 403 }
      );
    }
    
    // If it's a health record, use the built-in tracking function
    if (recordType === 'health_record') {
      await supabase.rpc('track_health_record_access', { record_id: recordId });
    }
    
    // Create an audit log entry
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        resource_type: recordType,
        resource_id: recordId,
        action: action,
        timestamp: new Date().toISOString()
      });
      
    if (error) {
      console.error('Error creating audit log:', error);
      // Continue execution - don't fail the request for logging issues
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error in audit logging API:', error);
    return NextResponse.json(
      { error: 'An error occurred while logging access' },
      { status: 500 }
    );
  }
} 