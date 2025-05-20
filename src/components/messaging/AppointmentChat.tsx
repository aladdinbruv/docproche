"use client";

import { useEffect, useState } from 'react';
import { useMessages } from '@/hooks/useMessages';
import { ChatInterface } from './ChatInterface';
import { useAuth } from '@/hooks/useAuth';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { FaCommentMedical } from 'react-icons/fa';

interface AppointmentChatProps {
  appointmentId: string;
  disablePHI?: boolean;
  collapsed?: boolean;
  className?: string;
}

export function AppointmentChat({
  appointmentId,
  disablePHI = false,
  collapsed = false,
  className = ''
}: AppointmentChatProps) {
  const [isExpanded, setIsExpanded] = useState(!collapsed);
  const [otherUserDetails, setOtherUserDetails] = useState<{
    id: string;
    name: string;
    image?: string;
  } | null>(null);
  const { user } = useAuth();
  const supabase = createClientComponentClient();
  
  const { unreadCount } = useMessages({
    appointmentId,
    autoRefresh: true,
    fetchUserDetails: false
  });
  
  useEffect(() => {
    if (!user || !appointmentId) return;
    
    const fetchAppointmentDetails = async () => {
      try {
        // First fetch the basic appointment data
        const { data: appointmentData, error: appointmentError } = await supabase
          .from('appointments')
          .select('doctor_id, patient_id')
          .eq('id', appointmentId)
          .single();
        
        if (appointmentError) {
          console.error('Error fetching appointment details:', appointmentError);
          return;
        }
        
        const isDoctor = user.id === appointmentData.doctor_id;
        
        // Then fetch the corresponding user details separately
        const otherUserId = isDoctor ? appointmentData.patient_id : appointmentData.doctor_id;
        
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, full_name, profile_image')
          .eq('id', otherUserId)
          .single();
          
        if (userError) {
          console.error('Error fetching user details:', userError);
          return;
        }
        
        setOtherUserDetails({
          id: userData.id,
          name: userData.full_name,
          image: userData.profile_image
        });
        
      } catch (err) {
        console.error('Error in appointment chat:', err);
      }
    };
    
    fetchAppointmentDetails();
  }, [user, appointmentId, supabase]);
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  if (!user || !appointmentId) {
    return null;
  }
  
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      <div 
        className="bg-blue-600 text-white p-3 flex items-center justify-between cursor-pointer"
        onClick={toggleExpand}
      >
        <div className="flex items-center">
          <FaCommentMedical className="mr-2" />
          <h3 className="font-medium">Appointment Communication</h3>
        </div>
        
        {!isExpanded && unreadCount > 0 && (
          <div className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1 min-w-[20px] text-center">
            {unreadCount}
          </div>
        )}
        
        <span className="ml-2">{isExpanded ? '▲' : '▼'}</span>
      </div>
      
      {isExpanded && (
        <div className="transition-all">
          {otherUserDetails ? (
            <ChatInterface
              appointmentId={appointmentId}
              otherUserId={otherUserDetails.id}
              otherUserName={otherUserDetails.name}
              otherUserImage={otherUserDetails.image}
              hideHeader={true}
              showPHIToggle={!disablePHI}
              autoRefresh={true}
            />
          ) : (
            <div className="p-4 text-center text-gray-500">
              Loading chat details...
            </div>
          )}
        </div>
      )}
    </div>
  );
} 