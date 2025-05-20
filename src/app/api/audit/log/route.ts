import { NextRequest, NextResponse } from 'next/server';
import { getServerComponentClient } from '@/lib/server-supabase';

/**
 * POST /api/audit/log
 * Endpoint for logging appointment actions from client components
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
    const { resourceType, resourceId, action, userId } = body;
    
    // Basic validation
    if (!resourceType || !resourceId || !action) {
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
    
    // Create an audit log entry
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        resource_type: resourceType,
        resource_id: resourceId,
        action: action,
        timestamp: new Date().toISOString()
      });
      
    if (error) {
      console.error('Error creating appointment action log:', error);
      // Continue execution - don't fail the request for logging issues
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error in appointment action logging API:', error);
    return NextResponse.json(
      { error: 'An error occurred while logging appointment action' },
      { status: 500 }
    );
  }
} 