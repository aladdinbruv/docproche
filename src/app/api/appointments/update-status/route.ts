import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
  try {
    const { appointmentId, status, notes } = await req.json();
    
    if (!appointmentId || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    const supabaseAdmin = createAdminClient();
    
    const updates: Record<string, any> = { status };
    if (notes) updates.notes = notes;
    
    const { error } = await supabaseAdmin
      .from('appointments')
      .update(updates)
      .eq('id', appointmentId);
    
    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating appointment status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update appointment status" },
      { status: 500 }
    );
  }
} 