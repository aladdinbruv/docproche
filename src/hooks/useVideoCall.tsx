// src/hooks/useVideoCall.tsx
import { useState, useEffect } from 'react';
import Video, { Room, LocalTrack, RemoteParticipant, ConnectOptions, LocalAudioTrack, LocalVideoTrack } from 'twilio-video';

export function useVideoCall() {
  const [room, setRoom] = useState<Room | null>(null);
  const [localTracks, setLocalTracks] = useState<LocalTrack[]>([]);
  const [remoteParticipants, setRemoteParticipants] = useState<RemoteParticipant[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Handle participants joining and leaving
  useEffect(() => {
    if (!room) return;
    
    const participantConnected = (participant: RemoteParticipant) => {
      console.log(`Participant ${participant.identity} connected`);
      setRemoteParticipants(prevParticipants => [...prevParticipants, participant]);
    };
    
    const participantDisconnected = (participant: RemoteParticipant) => {
      console.log(`Participant ${participant.identity} disconnected`);
      setRemoteParticipants(prevParticipants => 
        prevParticipants.filter(p => p !== participant)
      );
    };
    
    room.on('participantConnected', participantConnected);
    room.on('participantDisconnected', participantDisconnected);
    
    // Add existing participants
    room.participants.forEach(participantConnected);
    
    return () => {
      room.off('participantConnected', participantConnected);
      room.off('participantDisconnected', participantDisconnected);
    };
  }, [room]);
  
  const joinRoom = async (appointmentId: string, identity: string) => {
    try {
      setIsConnecting(true);
      setError(null);
      
      console.log(`Attempting to join room: ${appointmentId} with identity: ${identity}`);
      
      // Get access token from your API
      const response = await fetch('/api/video-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: appointmentId, identity }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Token API error:', errorData);
        throw new Error(`Could not get access token: ${errorData.error || response.statusText}`);
      }
      
      const { token } = await response.json();
      
      if (!token) {
        throw new Error('No token received from server');
      }
      
      console.log('Token received, length:', token.length);
      
      // Get local tracks
      console.log('Creating local tracks...');
      const tracks = await Video.createLocalTracks({
        audio: true,
        video: { width: 640, height: 480 }
      });
      
      setLocalTracks(tracks);
      console.log('Local tracks created:', tracks.length);
      
      // Connect to room with more detailed options
      console.log('Connecting to room...');
      const connectOptions: ConnectOptions = {
        name: appointmentId,
        tracks,
        // Add additional connect options for troubleshooting
        logLevel: 'debug',
        region: 'us1', // Add explicit region to avoid region mismatch issues
      };
      
      // Connect to room
      const newRoom = await Video.connect(token, connectOptions);
      
      console.log('Connected to room:', newRoom.name);
      setRoom(newRoom);
      setIsConnecting(false);
      return newRoom;
    } catch (err) {
      console.error('Error joining room:', err);
      
      // More detailed error handling
      let errorMessage = 'Unknown error connecting to video call';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Check for specific Twilio errors
        if (errorMessage.includes('AccessTokenIssuer') || errorMessage.includes('Invalid Access Token')) {
          errorMessage = 'Invalid video token. Please try refreshing the page or contact support.';
          
          // We might need to retry with a fresh token
          console.log('Detected token issue, may need a fresh token');
        } else if (errorMessage.includes('Permission denied')) {
          errorMessage = 'Camera or microphone permission denied. Please allow access and try again.';
        }
      }
      
      setError(err instanceof Error ? err : new Error(errorMessage));
      setIsConnecting(false);
      throw err;
    }
  };
  
  const leaveRoom = () => {
    if (room) {
      console.log('Disconnecting from room:', room.name);
      room.disconnect();
      setRoom(null);
    }
    
    // Stop local tracks
    localTracks.forEach(track => {
      console.log(`Stopping ${track.kind} track`);
      // Type guard to ensure the track has a stop method
      if (track.kind === 'audio' || track.kind === 'video') {
        // For audio and video tracks, we can safely call stop
        (track as LocalAudioTrack | LocalVideoTrack).stop();
      }
    });
    setLocalTracks([]);
    setRemoteParticipants([]);
  };
  
  const toggleAudio = () => {
    localTracks.forEach(track => {
      if (track.kind === 'audio') {
        track.isEnabled = !track.isEnabled;
        console.log(`Audio ${track.isEnabled ? 'unmuted' : 'muted'}`);
      }
    });
  };
  
  const toggleVideo = () => {
    localTracks.forEach(track => {
      if (track.kind === 'video') {
        track.isEnabled = !track.isEnabled;
        console.log(`Video ${track.isEnabled ? 'enabled' : 'disabled'}`);
      }
    });
  };
  
  return {
    room,
    localTracks,
    remoteParticipants,
    isConnecting,
    error,
    joinRoom,
    leaveRoom,
    toggleAudio,
    toggleVideo,
  };
}