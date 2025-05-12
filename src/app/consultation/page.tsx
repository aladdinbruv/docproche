// src/app/consultation/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { format, parseISO, isToday } from "date-fns";
import {
  Video, VideoOff, Mic, MicOff, Phone, User,
  Calendar, Clock, MessageSquare, ArrowLeft
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useVideoCall } from "@/hooks/useVideoCall";
import { VideoParticipant } from "@/components/VideoParticipant";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function PatientConsultationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointment");
  const { user, profile, isLoading: authLoading } = useAuth();
  
  const [appointment, setAppointment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isCallActive, setIsCallActive] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  
  const localVideoRef = useRef(null);
  const supabase = createClientComponentClient();
  
  const {
    room,
    localTracks,
    remoteParticipants,
    isConnecting,
    error: videoError,
    joinRoom,
    leaveRoom,
    toggleAudio,
    toggleVideo
  } = useVideoCall();
  
  // Check if user is authenticated and get appointment details
  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== 'patient')) {
      router.push('/auth/login?redirectTo=/consultation');
      return;
    }

    if (appointmentId && user && profile?.role === 'patient') {
      fetchAppointmentDetails();
    } else if (!appointmentId && !authLoading) {
      router.push('/appointments');
    }
  }, [appointmentId, user, profile, authLoading, router]);
  
  // Attach local video track
  useEffect(() => {
    const videoTrack = localTracks.find(track => track.kind === 'video');
    
    if (videoTrack && localVideoRef.current) {
      videoTrack.attach(localVideoRef.current);
      return () => {
        videoTrack.detach();
      };
    }
  }, [localTracks]);
  
  const fetchAppointmentDetails = async () => {
    setIsLoading(true);
    try {
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .select(`
          *,
          doctor:doctor_id (
            id,
            full_name,
            email,
            specialty,
            profile_image
          )
        `)
        .eq('id', appointmentId)
        .eq('patient_id', profile?.id || user?.id)
        .single();

      if (appointmentError) throw appointmentError;
      
      if (appointmentData) {
        setAppointment(appointmentData);
      }
    } catch (error) {
      console.error('Error fetching appointment details:', error);
      alert('Could not load appointment details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const joinVideoCall = async () => {
    if (!appointment) return;
    
    try {
      setIsCallActive(true);
      
      await joinRoom(
        appointment.id,
        `patient-${profile?.id || user?.id}`
      );
      
    } catch (error) {
      console.error('Error joining video call:', error);
      alert('Could not join video call. Please try again.');
      setIsCallActive(false);
    }
  };
  
  const endCall = () => {
    leaveRoom();
    setIsCallActive(false);
  };
  
  const addChatMessage = (text) => {
    setChatMessages(prev => [
      ...prev, 
      { text, sender: 'patient', timestamp: new Date() }
    ]);
  };
  
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    addChatMessage(newMessage);
    setNewMessage("");
  };
  
  if (isLoading || !appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-blue-600 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">
                Video Consultation
              </h1>
              <p className="text-blue-100">
                {isToday(parseISO(appointment.date)) 
                  ? `Today at ${appointment.time_slot}` 
                  : `${format(parseISO(appointment.date), 'MMMM d, yyyy')} at ${appointment.time_slot}`}
              </p>
            </div>
            <Button 
              variant="outline" 
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              onClick={() => router.push('/appointments')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Appointments
            </Button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Doctor Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Doctor Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                    {appointment.doctor?.profile_image ? (
                      <img 
                        src={appointment.doctor.profile_image} 
                        alt={appointment.doctor.full_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-blue-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">Dr. {appointment.doctor?.full_name}</h3>
                    <p className="text-sm text-gray-500">{appointment.doctor?.specialty}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-muted-foreground mr-3" />
                    <div>
                      <p className="text-sm font-medium">Date & Time</p>
                      <p className="text-sm">{format(parseISO(appointment.date), 'MMMM d, yyyy')}</p>
                      <p className="text-sm">{appointment.time_slot}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Video Area */}
          <div className="lg:col-span-2">
            <Card className="mb-6 overflow-hidden">
              <div className="relative w-full bg-black aspect-video">
                {isCallActive ? (
                  <>
                    {/* Main video - doctor */}
                    <div className="absolute inset-0">
                      {remoteParticipants.length > 0 ? (
                        <VideoParticipant participant={remoteParticipants[0]} />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
                          <div className="text-center">
                            <User className="h-24 w-24 mx-auto mb-4 opacity-20" />
                            <p className="text-xl">Waiting for doctor to join...</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Patient's local video */}
                    <div className="absolute bottom-4 right-4 w-48 h-36 border-2 border-white rounded-lg overflow-hidden">
                      <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    </div>
                    
                    {/* Call controls */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`rounded-full ${isAudioOn ? 'text-white' : 'bg-red-500 text-white'}`}
                        onClick={() => {
                          toggleAudio();
                          setIsAudioOn(!isAudioOn);
                        }}
                      >
                        {isAudioOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`rounded-full ${isVideoOn ? 'text-white' : 'bg-red-500 text-white'}`}
                        onClick={() => {
                          toggleVideo();
                          setIsVideoOn(!isVideoOn);
                        }}
                      >
                        {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="rounded-full"
                        onClick={endCall}
                      >
                        <Phone className="h-5 w-5 transform -rotate-135" />
                      </Button>
                    </div>
                  </>
                ) : (
                  // Join call button
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <div className="text-center text-white px-6">
                      <Video className="h-16 w-16 mx-auto mb-4 text-blue-400" />
                      <h3 className="text-xl font-semibold mb-2">Ready to join video consultation</h3>
                      <p className="mb-6 max-w-md text-gray-300">
                        Your doctor is waiting for you to join the call.
                        Make sure your camera and microphone are connected.
                      </p>
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={joinVideoCall}
                        disabled={isConnecting}
                      >
                        {isConnecting ? (
                          <>Connecting...</>
                        ) : (
                          <>
                            <Video className="h-4 w-4 mr-2" />
                            Join Video Call
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Chat section (visible when call is active) */}
              {isCallActive && (
                <div className="border-t h-64 flex flex-col">
                  <div className="p-4 bg-gray-50 border-b font-medium flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2 text-blue-500" />
                    Chat with Doctor
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {chatMessages.length === 0 ? (
                      <div className="text-center text-gray-400 py-6">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No messages yet. Start the conversation.</p>
                      </div>
                    ) : (
                      chatMessages.map((msg, i) => (
                        <div 
                          key={i} 
                          className={`flex ${msg.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`max-w-[80%] rounded-lg px-3 py-2 ${
                              msg.sender === 'patient' 
                                ? 'bg-blue-600 text-white rounded-br-none' 
                                : 'bg-gray-200 text-gray-800 rounded-bl-none'
                            }`}
                          >
                            <p>{msg.text}</p>
                            <p className={`text-xs ${msg.sender === 'patient' ? 'text-blue-100' : 'text-gray-500'} mt-1`}>
                              {format(msg.timestamp, 'h:mm a')}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-3 border-t flex gap-2">
                    <Input 
                      placeholder="Type a message..." 
                      value={newMessage} 
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button onClick={handleSendMessage}>Send</Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}