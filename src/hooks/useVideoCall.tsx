// src/hooks/useVideoCall.tsx
import { useState, useEffect, useRef } from 'react';
import Video, { Room, LocalTrack, RemoteParticipant } from 'twilio-video';

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
      setRemoteParticipants(prevParticipants => [...prevParticipants, participant]);
    };
    
    const participantDisconnected = (participant: RemoteParticipant) => {
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
      
      // Get access token from your API
      const response = await fetch('/api/video-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: appointmentId, identity }),
      });
      
      if (!response.ok) {
        throw new Error('Could not get access token');
      }
      
      const { token } = await response.json();
      
      // Get local tracks
      const tracks = await Video.createLocalTracks({
        audio: true,
        video: { width: 640, height: 480 }
      });
      
      setLocalTracks(tracks);
      
      // Connect to room
      const newRoom = await Video.connect(token, {
        name: appointmentId,
        tracks,
      });
      
      setRoom(newRoom);
      setIsConnecting(false);
      return newRoom;
    } catch (err) {
      console.error('Error joining room:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setIsConnecting(false);
      throw err;
    }
  };
  
  const leaveRoom = () => {
    if (room) {
      room.disconnect();
      setRoom(null);
    }
    
    // Stop local tracks
    localTracks.forEach(track => track.stop());
    setLocalTracks([]);
    setRemoteParticipants([]);
  };
  
  const toggleAudio = () => {
    localTracks.forEach(track => {
      if (track.kind === 'audio') {
        track.isEnabled = !track.isEnabled;
      }
    });
  };
  
  const toggleVideo = () => {
    localTracks.forEach(track => {
      if (track.kind === 'video') {
        track.isEnabled = !track.isEnabled;
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