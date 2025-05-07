import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from '@/lib/supabase-admin';
import { createClientComponentClient } from '@/lib/supabase';
import { v4 as uuidv4 } from "uuid";

// GET - Fetch time slots for a specific doctor
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const doctorId = url.searchParams.get("doctorId");
    
    if (!doctorId) {
      return NextResponse.json(
        { error: "Doctor ID is required" },
        { status: 400 }
      );
    }
    
    const supabase = createClientComponentClient();
    
    const { data, error } = await supabase
      .from("time_slots")
      .select("*")
      .eq("doctor_id", doctorId)
      .order("day_of_week", { ascending: true })
      .order("start_time", { ascending: true });
    
    if (error) throw error;
    
    return NextResponse.json({ time_slots: data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch time slots" },
      { status: 500 }
    );
  }
}

// POST - Create a new time slot
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { doctor_id, day_of_week, start_time, end_time, is_available } = body;
    
    // Validate required fields
    if (!doctor_id || day_of_week === undefined || !start_time || !end_time) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    const timeSlot = {
      id: uuidv4(),
      doctor_id,
      day_of_week,
      start_time,
      end_time,
      is_available: is_available === undefined ? true : is_available
    };
    
    const supabaseAdmin = createAdminClient();
    
    const { data, error } = await supabaseAdmin
      .from("time_slots")
      .insert(timeSlot)
      .select();
    
    if (error) throw error;
    
    return NextResponse.json({ 
      message: "Time slot created successfully", 
      time_slot: data[0]
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create time slot" },
      { status: 500 }
    );
  }
}

// PUT - Update an existing time slot
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, day_of_week, start_time, end_time, is_available } = body;
    
    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: "Time slot ID is required" },
        { status: 400 }
      );
    }
    
    const updates: Record<string, any> = {};
    if (day_of_week !== undefined) updates.day_of_week = day_of_week;
    if (start_time) updates.start_time = start_time;
    if (end_time) updates.end_time = end_time;
    if (is_available !== undefined) updates.is_available = is_available;
    
    const supabaseAdmin = createAdminClient();
    
    const { data, error } = await supabaseAdmin
      .from("time_slots")
      .update(updates)
      .eq("id", id)
      .select();
    
    if (error) throw error;
    
    return NextResponse.json({ 
      message: "Time slot updated successfully", 
      time_slot: data[0]
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update time slot" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a time slot
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { error: "Time slot ID is required" },
        { status: 400 }
      );
    }
    
    const supabaseAdmin = createAdminClient();
    
    const { error } = await supabaseAdmin
      .from("time_slots")
      .delete()
      .eq("id", id);
    
    if (error) throw error;
    
    return NextResponse.json({ 
      message: "Time slot deleted successfully"
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete time slot" },
      { status: 500 }
    );
  }
} 