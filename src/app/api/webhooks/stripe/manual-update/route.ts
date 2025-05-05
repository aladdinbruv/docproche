import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();
    
    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing session ID" },
        { status: 400 }
      );
    }
    
    console.log(`Manual update for session: ${sessionId}`);
    
    const supabaseAdmin = createAdminClient();
    
    // Find the payment record for this transaction
    const { data: paymentData, error: paymentFetchError } = await supabaseAdmin
      .from("payments")
      .select("id, appointment_id")
      .eq("transaction_id", sessionId);
    
    if (paymentFetchError) {
      console.error("Error fetching payment record:", paymentFetchError);
      throw paymentFetchError;
    }
    
    if (!paymentData || paymentData.length === 0) {
      return NextResponse.json(
        { error: "No payment record found for this session" },
        { status: 404 }
      );
    }
    
    const appointmentId = paymentData[0].appointment_id;
    
    // Update payment status
    const { error: paymentUpdateError } = await supabaseAdmin
      .from("payments")
      .update({ status: "successful" })
      .eq("transaction_id", sessionId);
    
    if (paymentUpdateError) {
      console.error("Error updating payment status:", paymentUpdateError);
      throw paymentUpdateError;
    }
    
    // Update appointment status
    const { error: appointmentError } = await supabaseAdmin
      .from("appointments")
      .update({ 
        payment_status: "paid",
        status: "confirmed" 
      })
      .eq("id", appointmentId);
    
    if (appointmentError) {
      console.error("Error updating appointment status:", appointmentError);
      throw appointmentError;
    }
    
    console.log(`Manual payment update for appointment ${appointmentId} completed successfully`);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Manual payment update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update payment status" },
      { status: 500 }
    );
  }
} 