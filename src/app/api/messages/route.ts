import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// GET - Fetch messages
export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check if the user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const user1Id = url.searchParams.get("user1Id");
    const user2Id = url.searchParams.get("user2Id");
    const appointmentId = url.searchParams.get("appointmentId");
    const limit = parseInt(url.searchParams.get("limit") || "50");

    if ((!user1Id || !user2Id) && !appointmentId) {
      return NextResponse.json(
        { error: "Either user IDs (both) or appointmentId is required" },
        { status: 400 }
      );
    }

    let query = supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(limit);

    if (appointmentId) {
      // Filter messages by appointment ID
      query = query.eq("appointment_id", appointmentId);
    } else if (user1Id && user2Id) {
      // Filter messages between two users (conversation)
      query = query.or(
        `and(sender_id.eq.${user1Id},receiver_id.eq.${user2Id}),and(sender_id.eq.${user2Id},receiver_id.eq.${user1Id})`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching messages:", error);
      return NextResponse.json(
        { error: "Failed to fetch messages" },
        { status: 500 }
      );
    }

    return NextResponse.json({ messages: data });
  } catch (err) {
    console.error("Error in messages API:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create a new message
export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check if the user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { sender_id, receiver_id, appointment_id, content, contains_phi } = body;

    // Validate required fields
    if (!sender_id || !receiver_id || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Ensure the sender is the authenticated user
    if (sender_id !== user.id) {
      return NextResponse.json(
        { error: "You can only send messages as yourself" },
        { status: 403 }
      );
    }

    // Create new message
    const { data, error } = await supabase.from("messages").insert({
      sender_id,
      receiver_id,
      appointment_id,
      content,
      contains_phi: contains_phi || false,
    }).select();

    if (error) {
      console.error("Error creating message:", error);
      return NextResponse.json(
        { error: "Failed to create message" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error("Error in messages API:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update a message (e.g., mark as read)
export async function PUT(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check if the user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id, read } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Message ID is required" },
        { status: 400 }
      );
    }

    // First check if the user is the receiver of the message
    const { data: message, error: fetchError } = await supabase
      .from("messages")
      .select("receiver_id")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Error fetching message:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch message" },
        { status: 500 }
      );
    }

    // Ensure the user is the receiver (only receivers can mark messages as read)
    if (message.receiver_id !== user.id) {
      return NextResponse.json(
        { error: "You can only update messages you received" },
        { status: 403 }
      );
    }

    // Update the message
    const updateData: Record<string, unknown> = {};
    if (read !== undefined) updateData.read = read;

    const { data, error } = await supabase
      .from("messages")
      .update(updateData)
      .eq("id", id)
      .select();

    if (error) {
      console.error("Error updating message:", error);
      return NextResponse.json(
        { error: "Failed to update message" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error("Error in messages API:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a message
export async function DELETE(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check if the user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const messageId = url.searchParams.get("id");

    if (!messageId) {
      return NextResponse.json(
        { error: "Message ID is required" },
        { status: 400 }
      );
    }

    // First check if the user is the sender of the message
    const { data: message, error: fetchError } = await supabase
      .from("messages")
      .select("sender_id")
      .eq("id", messageId)
      .single();

    if (fetchError) {
      console.error("Error fetching message:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch message" },
        { status: 500 }
      );
    }

    // Ensure the user is the sender (only senders can delete messages)
    if (message.sender_id !== user.id) {
      return NextResponse.json(
        { error: "You can only delete messages you sent" },
        { status: 403 }
      );
    }

    // Delete the message
    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", messageId);

    if (error) {
      console.error("Error deleting message:", error);
      return NextResponse.json(
        { error: "Failed to delete message" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error in messages API:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 