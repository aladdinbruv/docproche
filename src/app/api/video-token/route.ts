// src/app/api/video-token/route.ts
import { NextResponse } from 'next/server';
import twilio from 'twilio';

export async function POST(request: Request) {
  try {
    const { roomName, identity } = await request.json();
    
    console.log(`Generating token for identity: ${identity}, room: ${roomName}`);
    
    // Twilio credentials from environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const apiKey = process.env.TWILIO_API_KEY;
    const apiSecret = process.env.TWILIO_API_SECRET;
    
    // Validate credential formats
    if (accountSid && !accountSid.startsWith('AC')) {
      console.error('TWILIO_ACCOUNT_SID should start with AC, got:', accountSid.substring(0, 4));
      return NextResponse.json(
        { error: 'Invalid TWILIO_ACCOUNT_SID format - should start with AC' },
        { status: 500 }
      );
    }
    
    if (apiKey && !apiKey.startsWith('SK')) {
      console.error('TWILIO_API_KEY should start with SK, got:', apiKey.substring(0, 4));
      return NextResponse.json(
        { error: 'Invalid TWILIO_API_KEY format - should start with SK' },
        { status: 500 }
      );
    }
    
    // Log environment variable status (without logging the actual values)
    console.log(`Environment variables status:
      TWILIO_ACCOUNT_SID: ${accountSid ? `present (${accountSid.substring(0, 4)}...)` : 'missing'} (length: ${accountSid?.length || 0})
      TWILIO_API_KEY: ${apiKey ? `present (${apiKey.substring(0, 4)}...)` : 'missing'} (length: ${apiKey?.length || 0})
      TWILIO_API_SECRET: ${apiSecret ? 'present' : 'missing'} (length: ${apiSecret?.length || 0})`);
    
    if (!accountSid || !apiKey || !apiSecret) {
      console.error('Missing Twilio credentials');
      return NextResponse.json(
        { error: 'Twilio credentials not configured' },
        { status: 500 }
      );
    }
    
    // Create an access token manually to ensure all fields are correctly set
    try {
      // Create a token with proper AccountSid and API Key
      console.log(`Creating Twilio token with account SID: ${accountSid.substring(0, 4)}... and API key: ${apiKey.substring(0, 4)}...`);
      
      const token = new twilio.jwt.AccessToken(
        accountSid,
        apiKey,
        apiSecret,
        {
          identity: identity,
          ttl: 3600 // 1 hour validity
        }
      );
      
      // Add Video grant with roomName 
      const videoGrant = new twilio.jwt.AccessToken.VideoGrant({
        room: roomName
      });
      
      // Add the grant to the token
      token.addGrant(videoGrant);
      
      // Generate the JWT string
      const tokenString = token.toJwt();
      console.log('Token generated successfully with length:', tokenString.length);
      
      // Debug token structure (without printing full token)
      const tokenParts = tokenString.split('.');
      if (tokenParts.length === 3) {
        try {
          // Extract header info for debugging
          const headerB64 = tokenParts[0];
          const headerJson = Buffer.from(headerB64, 'base64').toString();
          const header = JSON.parse(headerJson);
          console.log('Token header:', JSON.stringify(header));
          
          // Check the payload (safely)
          const payloadB64 = tokenParts[1];
          const payloadJson = Buffer.from(payloadB64, 'base64').toString();
          const payload = JSON.parse(payloadJson);
          
          // Log issuer and subject which are crucial for this error
          console.log('Token issuer:', payload.iss);
          console.log('Token subject:', payload.sub);
        } catch (e) {
          console.error('Error parsing token parts:', e);
        }
      }
      
      return NextResponse.json({ token: tokenString });
    } catch (tokenError: Error | unknown) {
      const errorMessage = tokenError instanceof Error ? tokenError.message : 'Unknown token creation error';
      console.error('Error during token creation:', tokenError);
      
      // Try a third-party JWT library if Twilio's fails
      return NextResponse.json(
        { error: `Token creation failed: ${errorMessage}` },
        { status: 500 }
      );
    }
  } catch (error: Error | unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in video-token API:', error);
    return NextResponse.json(
      { error: `Failed to generate token: ${errorMessage}` },
      { status: 500 }
    );
  }
}