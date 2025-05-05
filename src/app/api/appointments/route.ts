import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

// GET - Fetch appointments for a specific user
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    const role = url.searchParams.get("role") || "patient";
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }
    
    const queryField = role === "doctor" ? "doctor_id" : "patient_id";
    
    const { data, error } = await supabase
      .from("appointments")
      .select("*, doctor:users!appointments_doctor_id_fkey(*)")
      .eq(queryField, userId)
      .order("date", { ascending: true });
    
    if (error) throw error;
    
    return NextResponse.json({ appointments: data });
  } catch (error: any) {
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
    const { doctor_id, patient_id, date, time, mode } = body;
    
    // Validate required fields
    if (!doctor_id || !patient_id || !date || !time || !mode) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    const appointment = {
      id: uuidv4(),
      doctor_id,
      patient_id,
      date,
      time,
      mode,
      status: "pending",
      payment_status: "pending",
    };
    
    const { data, error } = await supabase
      .from("appointments")
      .insert(appointment)
      .select();
    
    if (error) throw error;
    
    return NextResponse.json({ 
      message: "Appointment created successfully", 
      appointment: data[0]
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create appointment" },
      { status: 500 }
    );
  }
} 