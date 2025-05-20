"use client";

import { useState, useEffect } from 'react';
import { ContactsList } from '@/components/messaging/ContactsList';
import { ChatInterface } from '@/components/messaging/ChatInterface';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaEnvelope, FaUsers, FaArrowLeft } from 'react-icons/fa';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Contact {
  id: string;
  full_name: string;
  profile_image?: string;
  role: string;
  unreadCount: number;
  lastMessage?: {
    content: string;
    created_at: string;
  };
}

export default function MessagingPage() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const [appointmentOtherUser, setAppointmentOtherUser] = useState<Contact | null>(null);
  const { user, profile, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  
  // Get appointmentId from URL if provided
  useEffect(() => {
    const urlAppointmentId = searchParams.get('appointmentId');
    if (urlAppointmentId) {
      setAppointmentId(urlAppointmentId);
    }
  }, [searchParams]);
  
  // Fetch other user details for the appointment if appointmentId is provided
  useEffect(() => {
    if (!appointmentId || !user || !profile) return;
    
    const fetchAppointmentDetails = async () => {
      try {
        const { data: appointmentData, error: appointmentError } = await supabase
          .from('appointments')
          .select('doctor_id, patient_id, doctors(id, full_name, profile_image, role), patients:users!appointments_patient_id_fkey(id, full_name, profile_image, role)')
          .eq('id', appointmentId)
          .single();
        
        if (appointmentError) {
          console.error('Error fetching appointment details:', appointmentError);
          return;
        }
        
        // Determine if the current user is the doctor or patient
        const isDoctor = profile.role === 'doctor';
        
        let otherUserData;
        if (isDoctor) {
          otherUserData = appointmentData.patients;
        } else {
          otherUserData = appointmentData.doctors;
        }
        
        if (otherUserData) {
          const contact: Contact = {
            id: otherUserData.id,
            full_name: otherUserData.full_name,
            profile_image: otherUserData.profile_image,
            role: otherUserData.role,
            unreadCount: 0 // We'll set this to 0 as we don't have that info here
          };
          setAppointmentOtherUser(contact);
          setSelectedContact(contact);
          setShowChatOnMobile(true);
        }
      } catch (err) {
        console.error('Error fetching appointment details:', err);
      }
    };
    
    fetchAppointmentDetails();
  }, [appointmentId, user, profile, supabase]);
  
  // Handle selection of a contact
  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
    setShowChatOnMobile(true);
  };
  
  // Back button for mobile view
  const handleBackToContacts = () => {
    setShowChatOnMobile(false);
  };
  
  // Check for mobile view on window resize
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobileView();
    
    window.addEventListener('resize', checkMobileView);
    
    return () => {
      window.removeEventListener('resize', checkMobileView);
    };
  }, []);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login?redirectTo=/messaging');
    }
  }, [user, isLoading, router]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!user || !profile) {
    return null; // Handled by the redirect
  }
  
  // Determine which role to filter for in the contacts list
  const filterRole = profile.role === 'patient' ? 'doctor' : 'patient';
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <FaEnvelope className="mr-2" /> Messages
        </h1>
        <p className="text-gray-600 mt-2">
          {profile.role === 'doctor' 
            ? 'Communicate with your patients securely' 
            : 'Communicate with your healthcare providers securely'}
        </p>
      </div>
      
      <div className={`grid ${isMobileView ? 'grid-cols-1' : 'grid-cols-12 gap-4'}`}>
        {/* Contacts List (Left Column) */}
        {(!isMobileView || !showChatOnMobile) && (
          <div className={isMobileView ? 'col-span-1' : 'col-span-4'}>
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center">
                <FaUsers className="text-blue-500 mr-2" />
                <h2 className="text-lg font-semibold text-gray-800">
                  {filterRole === 'doctor' ? 'Your Doctors' : 'Your Patients'}
                </h2>
              </div>
              <ContactsList 
                onSelectContact={handleSelectContact}
                selectedContactId={selectedContact?.id}
                filterRole={filterRole}
              />
            </div>
          </div>
        )}
        
        {/* Chat Interface (Right Column) */}
        {(!isMobileView || showChatOnMobile) && (
          <div className={isMobileView ? 'col-span-1 mt-4' : 'col-span-8'}>
            {selectedContact ? (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                {isMobileView && (
                  <div className="bg-blue-600 text-white p-4">
                    <button onClick={handleBackToContacts} className="flex items-center">
                      <FaArrowLeft className="mr-2" />
                      Back to {filterRole === 'doctor' ? 'Doctors' : 'Patients'}
                    </button>
                  </div>
                )}
                <ChatInterface 
                  otherUserId={selectedContact.id}
                  otherUserName={selectedContact.full_name}
                  otherUserImage={selectedContact.profile_image}
                  appointmentId={appointmentId}
                  autoRefresh={true}
                  hideHeader={isMobileView}
                />
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md h-96 flex flex-col items-center justify-center p-6 text-center text-gray-500">
                <FaEnvelope className="text-gray-300 text-5xl mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">No conversation selected</h3>
                <p>
                  {isMobileView 
                    ? `Select a ${filterRole} from the list to start a conversation`
                    : `Select a ${filterRole} from the list on the left to start a conversation`}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <h3 className="text-lg font-medium text-blue-800 mb-2">About secure messaging</h3>
        <p className="text-sm text-blue-700">
          This secure messaging system is designed for non-urgent communication with your {filterRole === 'doctor' ? 'healthcare providers' : 'patients'}.
          For medical emergencies, please call emergency services or go to your nearest emergency room.
          {profile.role === 'doctor' && " Remember to mark any message containing Protected Health Information (PHI) using the toggle when sending."}
        </p>
      </div>
    </div>
  );
} 