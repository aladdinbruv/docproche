import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";
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
    
    // Fetch appointment details to include in the payment
    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .select("*, doctor_profiles(*)")
      .eq("id", appointmentId)
      .single();
    
    if (appointmentError) throw appointmentError;
    
    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }
    
    // Create a payment session with Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Appointment with ${appointment.doctor_profiles.full_name}`,
              description: `${appointment.date} at ${appointment.time}`,
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
    
    // Create a pending payment record in the database
    const payment = {
      id: uuidv4(),
      appointment_id: appointmentId,
      amount,
      transaction_id: session.id,
      status: "pending",
      payment_date: new Date().toISOString(),
    };
    
    const { error: paymentError } = await supabase
      .from("payments")
      .insert(payment);
    
    if (paymentError) throw paymentError;
    
    return NextResponse.json({ 
      url: session.url,
      sessionId: session.id
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create payment session" },
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
    
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      
      // Update payment status in the database
      const { error: paymentError } = await supabase
        .from("payments")
        .update({ status: "successful" })
        .eq("transaction_id", session.id);
      
      if (paymentError) throw paymentError;
      
      // Update appointment payment status
      const { error: appointmentError } = await supabase
        .from("appointments")
        .update({ payment_status: "paid" })
        .eq("id", session.metadata.appointmentId);
      
      if (appointmentError) throw appointmentError;
    }
    
    return NextResponse.json({ received: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to handle webhook" },
      { status: 500 }
    );
  }
} 