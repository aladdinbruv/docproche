import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";
import { createAdminClient } from '@/lib/supabase-admin';
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { appointmentId, amount, successUrl, cancelUrl } = body;
    
    // Validate required fields
    if (!appointmentId || !amount || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    const supabaseAdmin = createAdminClient();
    
    // Fetch appointment details to include in the payment
    const { data: appointmentData, error: appointmentError } = await supabaseAdmin
      .from("appointments")
      .select("*")
      .eq("id", appointmentId);
    
    if (appointmentError) throw appointmentError;
    
    if (!appointmentData || appointmentData.length === 0) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }
    
    const appointment = appointmentData[0];
    
    // Check if appointment already has a successful payment
    const { data: existingPayments, error: paymentsError } = await supabaseAdmin
      .from("payments")
      .select("id, status")
      .eq("appointment_id", appointmentId)
      .eq("status", "successful");
      
    if (paymentsError) throw paymentsError;
    
    if (existingPayments && existingPayments.length > 0) {
      return NextResponse.json({
        error: "This appointment has already been paid for",
        paymentId: existingPayments[0].id
      }, { status: 400 });
    }
    
    // Fetch doctor details separately
    const { data: doctorData, error: doctorError } = await supabaseAdmin
      .from("users")
      .select("full_name")
      .eq("id", appointment.doctor_id)
      .maybeSingle();
    
    if (doctorError) {
      console.error("Error fetching doctor details:", doctorError);
      // Continue with a default name if doctor details cannot be fetched
    }
    
    const doctorName = doctorData?.full_name || "your doctor";
    
    // Create a payment session with Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Appointment with ${doctorName}`,
              description: `${appointment.date} at ${appointment.time_slot}`,
            },
            unit_amount: amount * 100, // amount in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: {
        appointmentId,
      },
    });
    
    // Check for existing pending payment
    const { data: existingPendingPayments } = await supabaseAdmin
      .from("payments")
      .select("id")
      .eq("appointment_id", appointmentId)
      .eq("status", "pending");
      
    if (existingPendingPayments && existingPendingPayments.length > 0) {
      // Update existing pending payment
      const { error: updateError } = await supabaseAdmin
        .from("payments")
        .update({
          amount,
          transaction_id: session.id,
          payment_date: new Date().toISOString(),
        })
        .eq("id", existingPendingPayments[0].id);
        
      if (updateError) throw updateError;
    } else {
      // Create a new pending payment record
      const payment = {
        id: uuidv4(),
        appointment_id: appointmentId,
        amount,
        transaction_id: session.id,
        status: "pending",
        payment_date: new Date().toISOString(),
      };
      
      const { error: paymentError } = await supabaseAdmin
        .from("payments")
        .insert(payment);
      
      if (paymentError) throw paymentError;
    }
    
    return NextResponse.json({ 
      url: session.url,
      sessionId: session.id
    });
  } catch (error: any) {
    console.error("Payment creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payment session" },
      { status: 500 }
    );
  }
}

// API endpoint to check the status of a payment
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get("session_id");
    
    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }
    
    const supabaseAdmin = createAdminClient();
    
    // Get the payment details
    const { data: paymentData, error: paymentError } = await supabaseAdmin
      .from("payments")
      .select("id, status, appointment_id")
      .eq("transaction_id", sessionId);
      
    if (paymentError) throw paymentError;
    
    if (!paymentData || paymentData.length === 0) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      payment: paymentData[0]
    });
  } catch (error: any) {
    console.error("Error checking payment status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check payment status" },
      { status: 500 }
    );
  }
}

// Handle Stripe webhook events
export async function PUT(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature") as string;
    
    if (!signature) {
      return NextResponse.json(
        { error: "Missing Stripe signature" },
        { status: 400 }
      );
    }
    
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    
    const supabaseAdmin = createAdminClient();
    
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      
      // Update payment status in the database - use admin client for RLS bypass
      const { error: paymentError } = await supabaseAdmin
        .from("payments")
        .update({ status: "successful" })
        .eq("transaction_id", session.id);
      
      if (paymentError) throw paymentError;
      
      // Update appointment payment status
      const { error: appointmentError } = await supabaseAdmin
        .from("appointments")
        .update({ payment_status: "paid" })
        .eq("id", session.metadata.appointmentId);
      
      if (appointmentError) throw appointmentError;
    }
    
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook handling error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to handle webhook" },
      { status: 500 }
    );
  }
} 