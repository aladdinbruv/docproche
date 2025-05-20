import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from './useAuth';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  appointment_id?: string | null;
  content: string;
  read: boolean;
  created_at: string;
  updated_at: string | null;
  contains_phi: boolean;
  sender?: {
    full_name: string;
    profile_image?: string;
    role: string;
  };
  receiver?: {
    full_name: string;
    profile_image?: string;
    role: string;
  };
}

interface UseMessagesOptions {
  otherUserId?: string;
  appointmentId?: string;
  fetchUserDetails?: boolean;
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useMessages(options: UseMessagesOptions = {}) {
  const {
    otherUserId,
    appointmentId,
    fetchUserDetails = true,
    limit = 50,
    autoRefresh = false,
    refreshInterval = 10000, // 10 seconds by default
  } = options;

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClientComponentClient();
  const { user } = useAuth();

  // Function to fetch messages
  const fetchMessages = useCallback(async () => {
    if (!user) return;
    
    const currentUserId = user.id;
    
    if (!appointmentId && !otherUserId) {
      setError("Either appointmentId or otherUserId is required");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      let url = `/api/messages?limit=${limit}`;
      
      if (appointmentId) {
        url += `&appointmentId=${appointmentId}`;
      } else if (otherUserId) {
        url += `&user1Id=${currentUserId}&user2Id=${otherUserId}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch messages');
      }
      
      const data = await response.json();
      
      if (fetchUserDetails && data.messages && data.messages.length > 0) {
        // Fetch user details for senders and receivers
        const userIds = new Set(
          data.messages.flatMap((msg: Message) => [msg.sender_id, msg.receiver_id])
        );
        
        const userDetailsMap = new Map();
        
        for (const userId of userIds) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, full_name, profile_image, role')
            .eq('id', userId)
            .single();
            
          if (!userError && userData) {
            userDetailsMap.set(userId, userData);
          }
        }
        
        const enhancedMessages = data.messages.map((msg: Message) => ({
          ...msg,
          sender: userDetailsMap.get(msg.sender_id),
          receiver: userDetailsMap.get(msg.receiver_id)
        }));
        
        setMessages(enhancedMessages);
        
        // Count unread messages for current user
        const unread = enhancedMessages.filter(
          (msg: Message) => msg.receiver_id === currentUserId && !msg.read
        ).length;
        
        setUnreadCount(unread);
      } else {
        setMessages(data.messages || []);
        
        // Count unread messages for current user
        const unread = data.messages.filter(
          (msg: Message) => msg.receiver_id === currentUserId && !msg.read
        ).length;
        
        setUnreadCount(unread);
      }
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      setError(err.message || 'Failed to fetch messages');
    } finally {
      setIsLoading(false);
    }
  }, [user, otherUserId, appointmentId, limit, fetchUserDetails, supabase]);

  // Send a new message
  const sendMessage = async (content: string, containsPHI: boolean = false) => {
    if (!user) {
      setError('Authentication required');
      return null;
    }
    
    if (!content.trim()) {
      setError('Message content cannot be empty');
      return null;
    }
    
    if (!otherUserId && !appointmentId) {
      setError('Either recipientId or appointmentId is required');
      return null;
    }
    
    let receiverId = otherUserId;
    
    // If we have an appointmentId but no otherUserId, we need to fetch the other user from the appointment
    if (appointmentId && !otherUserId) {
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .select('patient_id, doctor_id')
        .eq('id', appointmentId)
        .single();
        
      if (appointmentError) {
        setError(appointmentError.message || 'Failed to fetch appointment details');
        return null;
      }
      
      receiverId = appointmentData.patient_id === user.id ? 
        appointmentData.doctor_id : appointmentData.patient_id;
    }
    
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender_id: user.id,
          receiver_id: receiverId,
          appointment_id: appointmentId,
          content,
          contains_phi: containsPHI
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }
      
      const data = await response.json();
      
      // Refresh messages after sending
      fetchMessages();
      
      return data.data;
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send message');
      return null;
    }
  };

  // Mark a message as read
  const markAsRead = async (messageId: string) => {
    if (!user) {
      setError('Authentication required');
      return false;
    }
    
    try {
      const response = await fetch('/api/messages', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: messageId,
          read: true
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to mark message as read');
      }
      
      // Update the local message state
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, read: true } : msg
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      return true;
    } catch (err: any) {
      console.error('Error marking message as read:', err);
      setError(err.message || 'Failed to mark message as read');
      return false;
    }
  };

  // Delete a message
  const deleteMessage = async (messageId: string) => {
    if (!user) {
      setError('Authentication required');
      return false;
    }
    
    try {
      const response = await fetch(`/api/messages?id=${messageId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete message');
      }
      
      // Update the local message state
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      
      return true;
    } catch (err: any) {
      console.error('Error deleting message:', err);
      setError(err.message || 'Failed to delete message');
      return false;
    }
  };

  // Setup real-time subscription for new messages
  useEffect(() => {
    if (!user || (!appointmentId && !otherUserId)) return;
    
    fetchMessages();
    
    // Set up interval for auto-refresh if enabled
    let intervalId: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      intervalId = setInterval(fetchMessages, refreshInterval);
    }
    
    // Cleanup
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [user, appointmentId, otherUserId, fetchMessages, autoRefresh, refreshInterval]);

  return {
    messages,
    isLoading,
    error,
    unreadCount,
    sendMessage,
    markAsRead,
    deleteMessage,
    refreshMessages: fetchMessages
  };
} 