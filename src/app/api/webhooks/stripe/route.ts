import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from '@/lib/supabase-admin';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature") as string;
    
    if (!signature) {
      return NextResponse.json(
        { error: "Missing Stripe signature" },
        { status: 400 }
      );
    }
    
    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    
    console.log(`Webhook received: ${event.type}`);
    
    const supabaseAdmin = createAdminClient();
    
    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        console.log(`Processing completed checkout session: ${session.id}`);
        
        // Find the payment record for this transaction
        const { data: paymentData, error: paymentFetchError } = await supabaseAdmin
          .from("payments")
          .select("id, appointment_id")
          .eq("transaction_id", session.id);
        
        if (paymentFetchError) {
          console.error("Error fetching payment record:", paymentFetchError);
          throw paymentFetchError;
        }
        
        if (!paymentData || paymentData.length === 0) {
          console.error("No payment record found for transaction:", session.id);
          throw new Error(`No payment record found for transaction: ${session.id}`);
        }
        
        const appointmentId = paymentData[0].appointment_id;
        
        // Update payment status
        const { error: paymentUpdateError } = await supabaseAdmin
          .from("payments")
          .update({ status: "successful" })
          .eq("transaction_id", session.id);
        
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
        
        console.log(`Payment for appointment ${appointmentId} completed successfully`);
        break;
      }
      
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment failed: ${paymentIntent.last_payment_error?.message}`);
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Webhook error: ${errorMessage}`);
    return NextResponse.json(
      { error: errorMessage || "Failed to handle webhook" },
      { status: 500 }
    );
  }
}