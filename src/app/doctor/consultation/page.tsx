"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { motion } from "framer-motion";
import { format, parseISO, isToday } from "date-fns";
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  Phone,
  X,
  MessageSquare,
  FileText,
  User,
  ClipboardList,
  FilePlus,
  Save,
  Calendar,
  Clock,
  Pill,
  Activity,
  AlertCircle,
  Settings,
  Volume2,
  VolumeX,
  ArrowLeft,
  CheckCircle2,
  Edit,
} from "lucide-react";
import { FaStethoscope, FaPrescriptionBottle, FaNotesMedical, FaFileMedical } from "react-icons/fa";

import { useAuth } from "@/hooks/useAuth";
import { useAppointments } from "@/hooks/useAppointments";
import { useHealthRecords } from "@/hooks/useHealthRecords";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useVideoCall } from '@/hooks/useVideoCall';
import { VideoParticipant } from '@/components/VideoParticipant';

type Appointment = {
  id: string;
  patient_id: string;
  doctor_id: string;
  date: string;
  time_slot: string;
  status: string;
  consultation_type: string;
  symptoms?: string;
  notes?: string;
  patient?: {
    id: string;
    full_name: string;
    email?: string;
    phone_number?: string;
    profile_image?: string;
  };
};

type HealthRecord = {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_id?: string;
  record_type: string;
  title: string;
  description?: string;
  file_url?: string;
  created_at: string;
};

export default function DoctorConsultationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointment");
  const { user, profile, isLoading: authLoading } = useAuth();
  
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [patientRecords, setPatientRecords] = useState<HealthRecord[]>([]);
  const [notes, setNotes] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [medications, setMedications] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [chatMessages, setChatMessages] = useState<{text: string, sender: 'doctor' | 'patient', timestamp: Date}[]>([]);
  const [newMessage, setNewMessage] = useState("");
  
  // Video consultation controls
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isCallActive, setIsCallActive] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  const supabase = createClientComponentClient();
  const { updateAppointmentStatus } = useAppointments(
    profile?.id || user?.id || '',
    'doctor'
  );
  const { createHealthRecord } = useHealthRecords();

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

  // Get appointment details
  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== 'doctor')) {
      router.push('/auth/login?redirectTo=/doctor/consultation');
      return;
    }

    if (appointmentId && user && profile?.role === 'doctor') {
      fetchAppointmentDetails();
    } else if (!appointmentId && !authLoading) {
      router.push('/doctor/appointments');
    }
  }, [appointmentId, user, profile, authLoading, router]);

  // Initialize notes from appointment data when it's loaded
  useEffect(() => {
    if (appointment?.notes) {
      setNotes(appointment.notes);
    }
  }, [appointment]);

  // Start video stream when call is activated
  useEffect(() => {
    if (isCallActive && appointment?.consultation_type === 'video') {
      startVideoCall();
    }
    return () => {
      // Clean up video streams when component unmounts or call ends
      if (localVideoRef.current?.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        localVideoRef.current.srcObject = null;
      }
    };
  }, [isCallActive, appointment]);

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
          patient:patient_id (
            id,
            full_name,
            email,
            phone_number,
            profile_image
          )
        `)
        .eq('id', appointmentId)
        .eq('doctor_id', profile?.id || user?.id)
        .single();

      if (appointmentError) throw appointmentError;
      
      if (appointmentData) {
        setAppointment(appointmentData);
        fetchPatientHealthRecords(appointmentData.patient_id);
      }
    } catch (error) {
      console.error('Error fetching appointment details:', error);
      alert('Could not load appointment details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPatientHealthRecords = async (patientId: string) => {
    try {
      const { data, error } = await supabase
        .from('health_records')
        .select('*')
        .eq('patient_id', patientId)
        .eq('doctor_id', profile?.id || user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatientRecords(data || []);
    } catch (error) {
      console.error('Error fetching patient health records:', error);
    }
  };

  const startVideoCall = async () => {
    if (!appointment) return;
    
    try {
      setIsCallActive(true);
      
      await joinRoom(
        appointment.id,
        `doctor-${profile?.id || user?.id}`
      );
      
      // Update appointment status to in-progress (optional)
      await updateAppointmentStatus(appointment.id, 'in-progress');
      
    } catch (error) {
      console.error('Error starting video call:', error);
      alert('Could not start video call. Please try again.');
      setIsCallActive(false);
    }
  };

  const endCall = () => {
    leaveRoom();
    setIsCallActive(false);
  };

  const addChatMessage = (text: string, sender: 'doctor' | 'patient') => {
    setChatMessages(prev => [
      ...prev, 
      { text, sender, timestamp: new Date() }
    ]);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    addChatMessage(newMessage, "doctor");
    setNewMessage("");
    
    // Simulate patient response after 3 seconds
    if (Math.random() > 0.5) {
      setTimeout(() => {
        const responses = [
          "Thank you for explaining that. I understand better now.",
          "I'll make sure to follow your recommendations.",
          "Should I continue with my current medications?",
          "When should I schedule a follow-up appointment?",
          "Is there anything else I should know about my condition?"
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addChatMessage(randomResponse, "patient");
      }, 3000);
    }
  };

  const handleSaveNotes = async () => {
    if (!appointment) return;
    
    setIsSaving(true);
    try {
      // Update appointment notes
      await updateAppointmentStatus(appointment.id, appointment.status as any, notes);
      
      alert('Medical notes saved successfully.');
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('Failed to save notes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEndConsultation = async () => {
    if (!appointment) return;
    
    setIsSaving(true);
    try {
      // End the call if it's active
      if (isCallActive) {
        endCall();
      }
      
      // Update appointment status
      const success = await updateAppointmentStatus(appointment.id, 'completed' as any, notes);
      
      if (!success) {
        throw new Error('Failed to update appointment status');
      }
      
      // Only create health record if we have diagnosis or treatment information
      if (diagnosis.trim() || treatment.trim()) {
        try {
          await createHealthRecord({
            patient_id: appointment.patient_id,
            appointment_id: appointment.id,
            record_type: 'Consultation',
            title: `Consultation on ${format(parseISO(appointment.date), 'MMMM d, yyyy')}`,
            description: `Diagnosis: ${diagnosis}\n\nTreatment Plan: ${treatment}${medications ? `\n\nMedications: ${medications}` : ''}${followUpDate ? `\n\nFollow-up Date: ${followUpDate}` : ''}`,
          });
        } catch (recordError) {
          console.error('Error creating health record:', recordError);
          // Continue even if health record creation fails
          // The appointment status has been updated successfully
        }
      }
      
      alert('Consultation completed successfully.');
      router.push('/doctor/appointments');
    } catch (error) {
      console.error('Error completing consultation:', error);
      alert('Failed to complete consultation. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <motion.div 
          className="h-16 w-16 border-t-4 border-blue-500 border-solid rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex justify-center items-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-xl">Appointment Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">The requested appointment could not be found or you don&apos;t have permission to access it.</p>
            <Button 
              onClick={() => router.push('/doctor/appointments')}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Appointments
            </Button>
          </CardContent>
        </Card>
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
                {appointment.consultation_type === 'video' ? 'Video Consultation' : 'In-Person Consultation'}
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
              onClick={() => router.push('/doctor/appointments')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Appointments
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Information Column */}
          <div className="lg:col-span-1">
            <Card className="mb-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Patient Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center mb-6">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 mb-4">
                    {appointment.patient?.profile_image ? (
                      <img 
                        src={appointment.patient.profile_image} 
                        alt={appointment.patient?.full_name || 'Patient'} 
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-10 w-10" />
                    )}
                  </div>
                  <h2 className="text-xl font-bold">{appointment.patient?.full_name || 'Patient'}</h2>
                  {appointment.patient?.email && (
                    <p className="text-gray-500 text-sm">{appointment.patient.email}</p>
                  )}
                </div>

                <div className="space-y-4">
                  {appointment.patient?.phone_number && (
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-blue-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p>{appointment.patient.phone_number}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-blue-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Appointment Date</p>
                      <p>{format(parseISO(appointment.date), 'MMMM d, yyyy')}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-blue-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Time Slot</p>
                      <p>{appointment.time_slot}</p>
                    </div>
                  </div>

                  {appointment.symptoms && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-gray-500 mb-2">Reported Symptoms</p>
                      <p className="bg-gray-50 p-3 rounded-md text-gray-700">{appointment.symptoms}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Patient Medical History */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Medical History</CardTitle>
              </CardHeader>
              <CardContent>
                {patientRecords.length === 0 ? (
                  <div className="text-center py-6">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">No records found</h3>
                    <p className="text-gray-500 max-w-xs mx-auto">
                      This patient doesn&apos;t have any previous health records with you.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {patientRecords.slice(0, 3).map((record) => (
                      <div key={record.id} className="py-3">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                              {record.record_type}
                            </span>
                            <h4 className="font-medium mt-1">{record.title}</h4>
                          </div>
                          <span className="text-xs text-gray-500">
                            {format(new Date(record.created_at), 'MMM d, yyyy')}
                          </span>
                        </div>
                        {record.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">{record.description}</p>
                        )}
                      </div>
                    ))}
                    {patientRecords.length > 3 && (
                      <div className="pt-3">
                        <Button 
                          variant="ghost" 
                          className="w-full text-blue-600"
                          onClick={() => router.push(`/doctor/health-records?patient=${appointment.patient_id}`)}
                        >
                          View All Records
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Consultation Area */}
          <div className="lg:col-span-2">
            {/* Video Consultation */}
            {appointment.consultation_type === 'video' && (
              <Card className="mb-6 overflow-hidden">
                <div className="relative w-full bg-black aspect-video">
                  {isCallActive ? (
                    <>
                      {/* Main video - remote participant */}
                      <div className="absolute inset-0">
                        {remoteParticipants.length > 0 ? (
                          <VideoParticipant participant={remoteParticipants[0]} />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
                            <div className="text-center">
                              <User className="h-24 w-24 mx-auto mb-4 opacity-20" />
                              <p className="text-xl">Waiting for patient to join...</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Doctor's local video */}
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
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                      <div className="text-center text-white px-6">
                        <Video className="h-16 w-16 mx-auto mb-4 text-blue-400" />
                        <h3 className="text-xl font-semibold mb-2">Ready to start video consultation</h3>
                        <p className="mb-6 max-w-md text-gray-300">
                          You can start the video call when you and the patient are ready.
                          Make sure your camera and microphone are connected.
                        </p>
                        <Button 
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={startVideoCall}
                          disabled={isConnecting}
                        >
                          {isConnecting ? (
                            <>Connecting...</>
                          ) : (
                            <>
                              <Video className="h-4 w-4 mr-2" />
                              Start Video Call
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
                      Chat with Patient
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
                            className={`flex ${msg.sender === 'doctor' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div 
                              className={`max-w-[80%] rounded-lg px-3 py-2 ${
                                msg.sender === 'doctor' 
                                  ? 'bg-blue-600 text-white rounded-br-none' 
                                  : 'bg-gray-200 text-gray-800 rounded-bl-none'
                              }`}
                            >
                              <p>{msg.text}</p>
                              <p className={`text-xs ${msg.sender === 'doctor' ? 'text-blue-100' : 'text-gray-500'} mt-1`}>
                                {format(msg.timestamp, 'h:mm a')}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-3 border-t flex">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button
                        className="ml-2"
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                      >
                        Send
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            )}
            
            {/* Consultation Information Tabs */}
            <Card>
              <Tabs defaultValue="notes" className="w-full">
                <TabsList className="w-full rounded-none border-b grid grid-cols-3">
                  <TabsTrigger value="notes" className="rounded-none">
                    <FileText className="h-4 w-4 mr-2" />
                    Medical Notes
                  </TabsTrigger>
                  <TabsTrigger value="diagnosis" className="rounded-none">
                    <FaStethoscope className="mr-2" />
                    Diagnosis & Treatment
                  </TabsTrigger>
                  <TabsTrigger value="record" className="rounded-none">
                    <FilePlus className="h-4 w-4 mr-2" />
                    Health Record
                  </TabsTrigger>
                </TabsList>
                
                {/* Medical Notes Tab */}
                <TabsContent value="notes" className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Consultation Notes</h3>
                  <p className="text-sm text-gray-500 mb-3">
                    Record your observations, examination findings, and other notes during the consultation.
                  </p>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter consultation notes here..."
                    className="min-h-[200px] mb-4"
                  />
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSaveNotes}
                      disabled={isSaving}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Notes
                    </Button>
                  </div>
                </TabsContent>
                
                {/* Diagnosis & Treatment Tab */}
                <TabsContent value="diagnosis" className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Diagnosis & Treatment Plan</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Diagnosis
                      </label>
                      <Textarea
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        placeholder="Enter diagnosis..."
                        className="min-h-[100px]"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Treatment Plan
                      </label>
                      <Textarea
                        value={treatment}
                        onChange={(e) => setTreatment(e.target.value)}
                        placeholder="Enter treatment plan..."
                        className="min-h-[100px]"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Medications
                      </label>
                      <Textarea
                        value={medications}
                        onChange={(e) => setMedications(e.target.value)}
                        placeholder="Enter prescribed medications..."
                        className="min-h-[80px]"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Follow-up Date (if needed)
                      </label>
                      <Input
                        type="date"
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                {/* Health Record Tab */}
                <TabsContent value="record" className="p-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-amber-800 mb-1">Health Record Creation</h4>
                        <p className="text-sm text-amber-700">
                          When you end the consultation, a health record will be automatically created based on 
                          the diagnosis and treatment information you&apos;ve provided.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-gray-50 p-4 border-b">
                      <h3 className="font-medium">Record Preview</h3>
                    </div>
                    <div className="p-4">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500">Record Type</p>
                          <p className="font-medium">Consultation</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Title</p>
                          <p className="font-medium">
                            Consultation on {format(parseISO(appointment.date), 'MMMM d, yyyy')}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Diagnosis</p>
                          <p className="font-medium">
                            {diagnosis || <span className="text-gray-400 italic">No diagnosis provided</span>}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Treatment Plan</p>
                          <p className="font-medium">
                            {treatment || <span className="text-gray-400 italic">No treatment plan provided</span>}
                          </p>
                        </div>
                        {medications && (
                          <div>
                            <p className="text-sm text-gray-500">Medications</p>
                            <p className="font-medium">{medications}</p>
                          </div>
                        )}
                        {followUpDate && (
                          <div>
                            <p className="text-sm text-gray-500">Follow-up Date</p>
                            <p className="font-medium">{followUpDate}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              {/* End Consultation Button */}
              <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {appointment.status === 'completed' ? (
                    <span className="flex items-center text-green-600">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      This consultation has been completed
                    </span>
                  ) : (
                    "End the consultation when you've finished"
                  )}
                </div>
                {appointment.status !== 'completed' && (
                  <Button 
                    variant="destructive"
                    onClick={handleEndConsultation}
                    disabled={isSaving}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    End Consultation
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 