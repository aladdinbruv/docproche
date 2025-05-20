import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from '@/lib/supabase-admin';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  try {
    console.log("Stripe webhook received");
    
    const body = await req.text();
    const signature = req.headers.get("stripe-signature") as string;
    
    if (!signature) {
      console.error("Missing Stripe signature");
      return NextResponse.json(
        { error: "Missing Stripe signature" },
        { status: 400 }
      );
    }
    
    console.log("Verifying webhook signature...");
    
    let event;
    try {
    // Verify webhook signature
      event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signature verification failed';
      console.error(`Webhook signature verification failed: ${errorMessage}`);
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${errorMessage}` },
        { status: 400 }
      );
    }
    
    console.log(`Webhook verified! Event type: ${event.type}`);
    
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
          
          // Try to find payment by looking at session metadata if available
          if (session.metadata && session.metadata.appointmentId) {
            const appointmentId = session.metadata.appointmentId;
            console.log(`Attempting to find payment using appointmentId from metadata: ${appointmentId}`);
            
            const { data: paymentByAppointment, error: appointmentLookupError } = await supabaseAdmin
              .from("payments")
              .select("id, appointment_id")
              .eq("appointment_id", appointmentId)
              .limit(1);
              
            if (appointmentLookupError) {
              console.error("Error looking up payment by appointment ID:", appointmentLookupError);
            } else if (paymentByAppointment && paymentByAppointment.length > 0) {
              console.log("Found payment by appointment ID:", paymentByAppointment[0].id);
              
              // Update payment record with transaction ID
              const { error: updatePaymentError } = await supabaseAdmin
                .from("payments")
                .update({ 
                  transaction_id: session.id,
                  status: "successful" 
                })
                .eq("id", paymentByAppointment[0].id);
                
              if (updatePaymentError) {
                console.error("Error updating payment:", updatePaymentError);
              } else {
                console.log("Payment updated successfully");
              }
                
              // Update appointment status
              const { error: updateAppointmentError } = await supabaseAdmin
                .from("appointments")
                .update({ 
                  payment_status: "paid",
                  status: "confirmed" 
                })
                .eq("id", paymentByAppointment[0].appointment_id);
                
              if (updateAppointmentError) {
                console.error("Error updating appointment:", updateAppointmentError);
              } else {
                console.log("Appointment updated successfully");
              }
                
              console.log(`Payment for appointment ${paymentByAppointment[0].appointment_id} completed successfully by appointment ID lookup`);
              return NextResponse.json({ received: true });
            }
          }
          
          // As a fallback, try to find the most recent pending payment
          console.log("Attempting to find most recent pending payment");
          const { data: recentPayments, error: recentPaymentError } = await supabaseAdmin
            .from("payments")
            .select("id, appointment_id")
            .eq("status", "pending")
            .order("payment_date", { ascending: false })
            .limit(1);
            
          if (recentPaymentError) {
            console.error("Error looking up recent payments:", recentPaymentError);
          } else if (recentPayments && recentPayments.length > 0) {
            console.log("Found recent pending payment:", recentPayments[0].id);
            
            // Update payment status
            const { error: updateRecentError } = await supabaseAdmin
              .from("payments")
              .update({ 
                transaction_id: session.id,
                status: "successful" 
              })
              .eq("id", recentPayments[0].id);
              
            if (updateRecentError) {
              console.error("Error updating recent payment:", updateRecentError);
            }
              
            // Update appointment status
            const { error: updateRecentAppError } = await supabaseAdmin
              .from("appointments")
              .update({ 
                payment_status: "paid",
                status: "confirmed" 
              })
              .eq("id", recentPayments[0].appointment_id);
              
            if (updateRecentAppError) {
              console.error("Error updating recent appointment:", updateRecentAppError);
            }
              
            console.log(`Most recent payment for appointment ${recentPayments[0].appointment_id} updated successfully`);
            return NextResponse.json({ received: true });
          }
          
          console.error("No matching payment record found for this transaction");
          return NextResponse.json({ 
            error: "No payment record found",
            received: true 
          });
        }
        
        const appointmentId = paymentData[0].appointment_id;
        
        // Update payment status
        const { error: paymentUpdateError } = await supabaseAdmin
          .from("payments")
          .update({ status: "successful" })
          .eq("transaction_id", session.id);
        
        if (paymentUpdateError) {
          console.error("Error updating payment status:", paymentUpdateError);
        } else {
          console.log("Payment status updated to successful");
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
        } else {
          console.log("Appointment status updated to confirmed");
        }
        
        console.log(`Payment for appointment ${appointmentId} completed successfully`);
        break;
      }
      
      case "payment_intent.succeeded": {
        console.log("Payment intent succeeded, attempting to update related records");
        
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // If we can extract the payment ID from metadata
        if (paymentIntent.metadata && paymentIntent.metadata.appointmentId) {
          const appointmentId = paymentIntent.metadata.appointmentId;
          console.log(`Found appointment ID in metadata: ${appointmentId}`);
          
          // Update appointment directly
          const { error: appointmentError } = await supabaseAdmin
            .from("appointments")
            .update({ 
              payment_status: "paid",
              status: "confirmed" 
            })
            .eq("id", appointmentId);
          
          if (appointmentError) {
            console.error("Error updating appointment:", appointmentError);
          } else {
            console.log(`Appointment ${appointmentId} updated successfully`);
          }
          
          // Find and update associated payment
          const { data: payments, error: paymentsError } = await supabaseAdmin
            .from("payments")
            .select("id")
            .eq("appointment_id", appointmentId);
            
          if (paymentsError) {
            console.error("Error finding payment for appointment:", paymentsError);
          } else if (payments && payments.length > 0) {
            const { error: paymentUpdateError } = await supabaseAdmin
              .from("payments")
              .update({ status: "successful" })
              .eq("id", payments[0].id);
              
            if (paymentUpdateError) {
              console.error("Error updating payment:", paymentUpdateError);
            } else {
              console.log(`Payment ${payments[0].id} updated successfully`);
            }
          }
        }
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