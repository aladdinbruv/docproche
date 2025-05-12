// src/app/api/video-token/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import twilio from 'twilio';

export async function POST(request: Request) {
  try {
    const { roomName, identity } = await request.json();
    
    // Twilio credentials from environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const apiKey = process.env.TWILIO_API_KEY;
    const apiSecret = process.env.TWILIO_API_SECRET;
    
    if (!accountSid || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'Twilio credentials not configured' },
        { status: 500 }
      );
    }
    
    // Create an access token with identity in the constructor options
    const AccessToken = twilio.jwt.AccessToken;
    const token = new AccessToken(
      accountSid, 
      apiKey, 
      apiSecret, 
      { identity: identity } // Pass identity in the options object
    );
    
    // Grant access to Video
    const videoGrant = new AccessToken.VideoGrant({
      room: roomName,
    });
    token.addGrant(videoGrant);
    
    return NextResponse.json({ token: token.toJwt() });
  } catch (error) {
    console.error('Error generating token:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}