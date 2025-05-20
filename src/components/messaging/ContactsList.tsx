"use client";

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import { FaSearch, FaCircle } from 'react-icons/fa';

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

interface ContactsListProps {
  onSelectContact: (contact: Contact) => void;
  selectedContactId?: string;
  filterRole?: 'patient' | 'doctor';
  className?: string;
}

export function ContactsList({
  onSelectContact,
  selectedContactId,
  filterRole,
  className = ''
}: ContactsListProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (!user) return;
    
    async function fetchContacts() {
      setIsLoading(true);
      setError(null);
      
      try {
        // First, find all users who are in conversations with the current user
        const { data: messageData, error: messageError } = await supabase
          .from('messages')
          .select('sender_id, receiver_id')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
        
        if (messageError) throw messageError;
        
        // Extract unique user IDs from messages
        const uniqueContactIds = new Set<string>();
        
        messageData?.forEach(msg => {
          const contactId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
          uniqueContactIds.add(contactId);
        });
        
        // Also add users from appointments (doctors or patients)
        const appointmentField = filterRole === 'doctor' ? 'patient_id' : 'doctor_id';
        const counterpartField = filterRole === 'doctor' ? 'doctor_id' : 'patient_id';
        
        const { data: appointmentData, error: appointmentError } = await supabase
          .from('appointments')
          .select(`id, ${appointmentField}`)
          .eq(counterpartField, user.id)
          .not(appointmentField, 'is', null);
          
        if (appointmentError) throw appointmentError;
        
        appointmentData?.forEach(appt => {
          uniqueContactIds.add(appt[appointmentField]);
        });
        
        // Remove the current user from the list
        uniqueContactIds.delete(user.id);
        
        // Filter by role if specified
        let contactQuery = supabase
          .from('users')
          .select('id, full_name, profile_image, role');
          
        if (filterRole) {
          contactQuery = contactQuery.eq('role', filterRole);
        }
        
        // Add contact IDs to the query
        const contactIdsArray = Array.from(uniqueContactIds);
        contactQuery = contactQuery.in('id', contactIdsArray);
        
        const { data: contactsData, error: contactsError } = await contactQuery;
        
        if (contactsError) throw contactsError;
        
        // Fetch unread message counts for each contact
        const contactsWithUnreadCount = await Promise.all(
          contactsData.map(async (contact) => {
            const { count, error: countError } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('sender_id', contact.id)
              .eq('receiver_id', user.id)
              .eq('read', false);
              
            if (countError) {
              console.error('Error counting unread messages:', countError);
              return { 
                ...contact, 
                unreadCount: 0
              };
            }
            
            // Get last message for this contact
            const { data: lastMessageData, error: lastMessageError } = await supabase
              .from('messages')
              .select('content, created_at')
              .or(`and(sender_id.eq.${contact.id},receiver_id.eq.${user.id}),and(sender_id.eq.${user.id},receiver_id.eq.${contact.id})`)
              .order('created_at', { ascending: false })
              .limit(1);
              
            const lastMessage = lastMessageError || !lastMessageData?.length ? 
              undefined : 
              lastMessageData[0];
              
            return { 
              ...contact, 
              unreadCount: count || 0,
              lastMessage
            };
          })
        );
        
        // Sort by unread count and then by name
        const sortedContacts = contactsWithUnreadCount.sort((a, b) => {
          if (b.unreadCount !== a.unreadCount) {
            return b.unreadCount - a.unreadCount;
          }
          
          // If same unread count, sort by most recent message
          if (a.lastMessage && b.lastMessage) {
            return new Date(b.lastMessage.created_at).getTime() - 
                   new Date(a.lastMessage.created_at).getTime();
          }
          
          // If no message, sort alphabetically
          return a.full_name.localeCompare(b.full_name);
        });
        
        setContacts(sortedContacts);
        setFilteredContacts(sortedContacts);
      } catch (err: any) {
        console.error('Error fetching contacts:', err);
        setError(err.message || 'Failed to load contacts');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchContacts();
  }, [user, filterRole, supabase]);
  
  // Filter contacts when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredContacts(contacts);
      return;
    }
    
    const filtered = contacts.filter(contact => 
      contact.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredContacts(filtered);
  }, [searchQuery, contacts]);
  
  // Format the timestamp for last message
  const formatLastMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Today, show time
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      // Yesterday
      return 'Yesterday';
    } else if (diffDays < 7) {
      // Within a week, show day name
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      // Older, show date
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };
  
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-800">Conversations</h3>
        <div className="mt-2 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={`Search ${filterRole || 'contacts'}...`}
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>
      
      <div className="max-h-[500px] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="p-4 text-red-500 text-center">
            {error}
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchQuery ? 
              'No contacts match your search. Try a different query.' : 
              `No ${filterRole || 'contacts'} found. Start a conversation from appointments.`
            }
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredContacts.map((contact) => (
              <li 
                key={contact.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition ${
                  selectedContactId === contact.id ? 'bg-blue-50' : ''
                }`}
                onClick={() => onSelectContact(contact)}
              >
                <div className="flex items-start">
                  <div className="relative flex-shrink-0 mr-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                      {contact.profile_image ? (
                        <Image
                          src={contact.profile_image}
                          alt={contact.full_name}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-blue-100 text-blue-500 font-bold text-lg">
                          {contact.full_name.charAt(0)}
                        </div>
                      )}
                    </div>
                    {contact.unreadCount > 0 && (
                      <div className="absolute -bottom-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                        {contact.unreadCount}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {contact.full_name}
                      </h4>
                      {contact.lastMessage && (
                        <span className="text-xs text-gray-500">
                          {formatLastMessageTime(contact.lastMessage.created_at)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      <span className="text-xs capitalize">{contact.role}</span>
                      {contact.lastMessage && ' • '}
                      {contact.lastMessage?.content}
                    </p>
                    {contact.unreadCount > 0 && (
                      <div className="flex items-center mt-1 text-xs text-blue-600">
                        <FaCircle size={8} className="mr-1" />
                        {contact.unreadCount} new {contact.unreadCount === 1 ? 'message' : 'messages'}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 