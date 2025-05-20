import { NextRequest, NextResponse } from "next/server";
import { ensureStorageBuckets } from "@/lib/supabase-admin";

// This route ensures storage buckets and other necessary resources are created
// It can be called during deployment or app initialization
export async function GET(request: NextRequest) {
  try {
    const initResults = {
      storage: {
        initialized: false,
        message: ""
      },
      // Add other initialization results here as needed
    };
    
    // Initialize storage buckets
    console.log("API: Initializing storage buckets...");
    const bucketsInitialized = await ensureStorageBuckets();
    
    if (!bucketsInitialized) {
      initResults.storage = {
        initialized: false,
        message: "Failed to initialize storage buckets"
      };
      
      console.error("API: Storage buckets initialization failed");
      
      return NextResponse.json(
        { 
          success: false, 
          message: "Failed to initialize storage buckets",
          details: initResults
        },
        { status: 500 }
      );
    }
    
    initResults.storage = {
      initialized: true,
      message: "Storage buckets initialized successfully"
    };
    
    console.log("API: Storage buckets initialized successfully");
    
    // Add additional initialization steps as needed
    
    return NextResponse.json(
      { 
        success: true, 
        message: "Application initialized successfully",
        details: initResults
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("API: Initialization error:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Application initialization failed",
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 