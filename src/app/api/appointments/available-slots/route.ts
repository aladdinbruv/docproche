import { NextRequest, NextResponse } from "next/server";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { format } from "date-fns";

// GET - Fetch available time slots for a specific doctor on a specific date
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const doctorId = url.searchParams.get("doctorId");
    const dateStr = url.searchParams.get("date");
    
    if (!doctorId || !dateStr) {
      return NextResponse.json(
        { error: "Doctor ID and date are required" },
        { status: 400 }
      );
    }
    
    // Parse the date to get the day of week (0-6, where 0 is Sunday)
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();
    
    const supabase = createClientComponentClient();
    
    // Get available time slots for the doctor on the specified day of week
    const { data: timeSlots, error: timeSlotsError } = await supabase
      .from("time_slots")
      .select("*")
      .eq("doctor_id", doctorId)
      .eq("day_of_week", dayOfWeek)
      .eq("is_available", true)
      .order("start_time", { ascending: true });
    
    if (timeSlotsError) {
      throw timeSlotsError;
    }
    
    // Check if any of these time slots are already booked for this date
    // Convert the date to ISO format string (YYYY-MM-DD)
    const formattedDate = format(date, "yyyy-MM-dd");
    
    // Get booked appointments for this doctor on this date
    const { data: bookedAppointments, error: appointmentsError } = await supabase
      .from("appointments")
      .select("time_slot")
      .eq("doctor_id", doctorId)
      .eq("date", formattedDate)
      .not("status", "eq", "cancelled");
    
    if (appointmentsError) {
      throw appointmentsError;
    }
    
    // Create a set of booked time slots
    const bookedTimeSlots = new Set(bookedAppointments?.map(apt => apt.time_slot) || []);
    
    // Filter out booked time slots
    const availableTimeSlots = timeSlots.filter(slot => {
      return !bookedTimeSlots.has(slot.start_time);
    });
    
    // Format time slots for frontend
    const formattedTimeSlots = availableTimeSlots.map(slot => ({
      id: slot.id,
      startTime: slot.start_time,
      endTime: slot.end_time,
      available: true
    }));
    
    return NextResponse.json({ time_slots: formattedTimeSlots });
  } catch (error: any) {
    console.error("Error fetching available time slots:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch available time slots" },
      { status: 500 }
    );
  }
} 