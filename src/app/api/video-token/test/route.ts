import { NextResponse } from 'next/server';
import twilio from 'twilio';

export async function GET(request: Request) {
  try {
    // Test values
    const identity = "test-user";
    const roomName = "test-room";
    
    console.log(`Testing token generation for identity: ${identity}, room: ${roomName}`);
    
    // Twilio credentials from environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const apiKey = process.env.TWILIO_API_KEY;
    const apiSecret = process.env.TWILIO_API_SECRET;
    
    // Log more details about the credentials (safely)
    console.log(`Credentials check:
      TWILIO_ACCOUNT_SID: ${accountSid ? 'present (' + accountSid.substring(0, 4) + '...)' : 'missing'}
      TWILIO_API_KEY: ${apiKey ? 'present (' + apiKey.substring(0, 4) + '...)' : 'missing'}
      TWILIO_API_SECRET: ${apiSecret ? 'present (length ' + apiSecret.length + ')' : 'missing'}`);
    
    if (!accountSid || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'Twilio credentials not configured' },
        { status: 500 }
      );
    }
    
    // Create an access token
    const AccessToken = twilio.jwt.AccessToken;
    try {
      // Create the token with more clear error handling
      console.log('Creating AccessToken with identity:', identity);
      const token = new AccessToken(
        accountSid,
        apiKey,
        apiSecret,
        { identity: identity }
      );
      
      // Grant access to Video
      console.log('Adding video grant for room:', roomName);
      const videoGrant = new AccessToken.VideoGrant({
        room: roomName,
      });
      token.addGrant(videoGrant);
      
      // Generate the JWT
      const jwt = token.toJwt();
      console.log('Token generated successfully');
      
      // Get base token parts for debugging
      const tokenParts = jwt.split('.');
      if (tokenParts.length === 3) {
        // Get header and payload WITHOUT decoding the signature
        const [headerB64, payloadB64] = tokenParts;
        
        // Base64 decode to get the raw JSON
        const headerJson = Buffer.from(headerB64, 'base64').toString();
        const payloadJson = Buffer.from(payloadB64, 'base64').toString();
        
        // Parse and log (but mask sensitive parts)
        const header = JSON.parse(headerJson);
        const payload = JSON.parse(payloadJson);
        
        console.log('JWT Header:', JSON.stringify(header));
        
        // Create a safe copy of payload for logging (to not expose sensitive information)
        const safePayload = { ...payload };
        if (safePayload.grants) {
          // Just show what grants exist without showing details
          safePayload.grants = Object.keys(safePayload.grants);
        }
        
        console.log('JWT Payload (keys only):', JSON.stringify(safePayload));
        
        // Check specific fields relevant to the issuer/subject error
        console.log('Token issuer:', payload.iss);
        console.log('Token subject:', payload.sub);
        
        return NextResponse.json({ 
          token: jwt,
          header: header,
          payload: safePayload,
          tokenDetails: {
            length: jwt.length,
            parts: tokenParts.length
          }
        });
      }
      
      return NextResponse.json({ token: jwt });
    } catch (tokenError: Error | unknown) {
      const errorMessage = tokenError instanceof Error ? tokenError.message : 'Unknown token creation error';
      console.error('Error during token creation:', tokenError);
      return NextResponse.json(
        { error: `Token creation failed: ${errorMessage}` },
        { status: 500 }
      );
    }
  } catch (error: Error | unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in video-token test API:', error);
    return NextResponse.json(
      { error: `Failed to generate token: ${errorMessage}` },
      { status: 500 }
    );
  }
} 