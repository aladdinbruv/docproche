'use client';

// src/components/VideoParticipant.tsx
import { useEffect, useRef, useState } from 'react';
import { RemoteParticipant, RemoteTrackPublication, RemoteTrack } from 'twilio-video';
import { User } from 'lucide-react';

interface VideoParticipantProps {
  participant: RemoteParticipant;
}

export function VideoParticipant({ participant }: VideoParticipantProps) {
  const [videoTrack, setVideoTrack] = useState<RemoteTrack | null>(null);
  const [audioTrack, setAudioTrack] = useState<RemoteTrack | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  useEffect(() => {
    function trackSubscribed(track: RemoteTrack) {
      if (track.kind === 'video') {
        setVideoTrack(track);
      } else if (track.kind === 'audio') {
        setAudioTrack(track);
      }
    }
    
    function trackUnsubscribed(track: RemoteTrack) {
      if (track.kind === 'video') {
        setVideoTrack(null);
      } else if (track.kind === 'audio') {
        setAudioTrack(null);
      }
    }
    
    // Handle existing tracks
    participant.tracks.forEach((publication: RemoteTrackPublication) => {
      if (publication.isSubscribed) {
        trackSubscribed(publication.track);
      }
    });
    
    // Handle new track subscriptions
    participant.on('trackSubscribed', trackSubscribed);
    participant.on('trackUnsubscribed', trackUnsubscribed);
    
    return () => {
      participant.off('trackSubscribed', trackSubscribed);
      participant.off('trackUnsubscribed', trackUnsubscribed);
    };
  }, [participant]);
  
  // Attach video track to video element
  useEffect(() => {
    if (videoTrack && videoRef.current) {
      videoTrack.attach(videoRef.current);
      return () => {
        videoTrack.detach();
      };
    }
  }, [videoTrack]);
  
  // Attach audio track to audio element
  useEffect(() => {
    if (audioTrack && audioRef.current) {
      audioTrack.attach(audioRef.current);
      return () => {
        audioTrack.detach();
      };
    }
  }, [audioTrack]);
  
  return (
    <div className="w-full h-full relative">
      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
      <audio ref={audioRef} autoPlay />
      
      {!videoTrack && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="text-center text-white">
            <User className="h-24 w-24 mx-auto mb-4 opacity-20" />
            <p>{participant.identity}</p>
          </div>
        </div>
      )}
    </div>
  );
}