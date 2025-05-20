import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { createAdminClient } from '@/lib/supabase-admin';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET - Fetch appointments for a specific user
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const doctorId = searchParams.get('doctor_id');
    const patientId = searchParams.get('patient_id');
    const status = searchParams.get('status');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    
    if (!doctorId && !patientId) {
      return NextResponse.json(
        { error: "Either doctor_id or patient_id is required" },
        { status: 400 }
      );
    }
    
    const supabaseAdmin = createAdminClient();
    
    let query = supabaseAdmin.from("appointments").select("*");
    
    if (doctorId) {
      query = query.eq("doctor_id", doctorId);
    }
    
    if (patientId) {
      query = query.eq("patient_id", patientId);
    }
    
    if (status) {
      query = query.eq("status", status);
    }
    
    if (dateFrom) {
      query = query.gte("date", dateFrom);
    }
    
    if (dateTo) {
      query = query.lte("date", dateTo);
    }
    
    const { data, error } = await query.order("date", { ascending: true });
    
    if (error) throw error;
    
    return NextResponse.json({ appointments: data || [] });
  } catch (error: any) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}

// POST - Create a new appointment
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { doctor_id, patient_id, date, time_slot, consultation_type, symptoms, pay_later = false } = body;
    
    // Validate required fields
    if (!doctor_id || !patient_id || !date || !time_slot || !consultation_type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Generate a unique ID for the appointment
    const appointmentId = uuidv4();
    
    const supabaseAdmin = createAdminClient();
    
    const appointment = {
      id: appointmentId,
      doctor_id,
      patient_id,
      date,
      time_slot,
      consultation_type,
      symptoms: symptoms || null,
      status: pay_later ? "confirmed" : "pending",
      payment_status: "unpaid", // All appointments start as unpaid, then get updated to paid after payment
      created_by: patient_id,
      created_at: new Date().toISOString(),
    };
    
    // Insert the appointment
    const { error: insertError } = await supabaseAdmin
      .from("appointments")
      .insert(appointment);
    
    if (insertError) throw insertError;
    
    // Get the client Supabase instance to use the secure RPC function
    const clientSupabase = createRouteHandlerClient({ cookies });
    
    // Fetch the appointment data using the secure function to ensure RLS doesn't block it
    const { data: appointmentData, error: fetchError } = await clientSupabase
      .rpc('get_appointment_by_id', { appointment_id: appointmentId });
      
    if (fetchError) {
      console.error("Error fetching created appointment:", fetchError);
      // Even if there's an error fetching, we can still return the basic appointment object
      return NextResponse.json({ 
        message: "Appointment created successfully, but couldn't fetch details", 
        appointment: appointment
      });
    }
    
    // Return the appointment data
    // If RPC returns an array, use the first item, otherwise use the data directly
    const createdAppointment = Array.isArray(appointmentData) && appointmentData.length > 0 
      ? appointmentData[0] 
      : (appointmentData || appointment); // Fallback to the original appointment object
    
    return NextResponse.json({ 
      message: "Appointment created successfully", 
      appointment: createdAppointment
    });
  } catch (error: any) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create appointment" },
      { status: 500 }
    );
  }
} 