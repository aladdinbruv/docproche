"use client";

import { useState, useRef, useEffect } from 'react';
import { useMessages } from '@/hooks/useMessages';
import { MessageBubble } from './MessageBubble';
import { useAuth } from '@/hooks/useAuth';
import { FaPaperPlane, FaSpinner, FaEye, FaExclamationCircle } from 'react-icons/fa';
import { MdMedicalServices } from 'react-icons/md';

interface ChatInterfaceProps {
  otherUserId?: string;
  appointmentId?: string;
  otherUserName?: string;
  otherUserImage?: string;
  hideHeader?: boolean;
  showPHIToggle?: boolean;
  className?: string;
  autoRefresh?: boolean;
}

export function ChatInterface({
  otherUserId,
  appointmentId,
  otherUserName,
  otherUserImage,
  hideHeader = false,
  showPHIToggle = true,
  className = '',
  autoRefresh = true
}: ChatInterfaceProps) {
  const [newMessage, setNewMessage] = useState('');
  const [containsPHI, setContainsPHI] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, profile } = useAuth();
  
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    deleteMessage,
    refreshMessages
  } = useMessages({
    otherUserId,
    appointmentId,
    fetchUserDetails: true,
    autoRefresh
  });
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    const success = await sendMessage(newMessage, containsPHI);
    
    if (success) {
      setNewMessage('');
      // Keep PHI toggle on if user has it on
    }
  };
  
  const handleDeleteMessage = async (messageId: string) => {
    await deleteMessage(messageId);
  };
  
  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Please login to use the chat</p>
      </div>
    );
  }
  
  return (
    <div className={`flex flex-col bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {/* Chat header */}
      {!hideHeader && (
        <div className="bg-blue-600 text-white p-4 flex items-center">
          <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full overflow-hidden mr-3">
            {otherUserImage && (
              <img 
                src={otherUserImage} 
                alt={otherUserName || 'User'} 
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div>
            <h3 className="font-medium">{otherUserName || 'Chat'}</h3>
            <p className="text-xs text-blue-200">
              {appointmentId ? 'Appointment Chat' : 'Direct Message'}
            </p>
          </div>
          <button
            onClick={refreshMessages}
            className="ml-auto p-2 rounded-full hover:bg-blue-700 transition"
            aria-label="Refresh messages"
          >
            <FaEye size={16} />
          </button>
        </div>
      )}
      
      {/* Messages container */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50" style={{ minHeight: '300px', maxHeight: '500px' }}>
        {isLoading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <FaSpinner className="animate-spin text-blue-500 mr-2" />
            <span className="text-gray-500">Loading messages...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-red-500">
            <FaExclamationCircle className="mr-2" />
            <span>Error: {error}</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <FaPaperPlane className="mb-2" />
            <span>No messages yet. Start the conversation!</span>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                id={message.id}
                content={message.content}
                sentAt={message.created_at}
                isCurrentUser={message.sender_id === user.id}
                senderName={message.sender?.full_name || 'User'}
                senderImage={message.sender?.profile_image}
                read={message.read}
                containsPHI={message.contains_phi}
                onDelete={handleDeleteMessage}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      {/* Message input */}
      <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4">
        {showPHIToggle && (
          <div className="flex items-center mb-2">
            <label className="flex items-center cursor-pointer">
              <div className="relative mr-2">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={containsPHI}
                  onChange={() => setContainsPHI(!containsPHI)}
                />
                <div className={`w-10 h-5 ${containsPHI ? 'bg-amber-500' : 'bg-gray-300'} rounded-full shadow-inner transition-colors`}></div>
                <div className={`absolute left-0 top-0 w-5 h-5 bg-white rounded-full shadow transform transition-transform ${containsPHI ? 'translate-x-5' : ''}`}></div>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MdMedicalServices className={`mr-1 ${containsPHI ? 'text-amber-500' : 'text-gray-400'}`} />
                Contains PHI/sensitive medical information
              </div>
            </label>
          </div>
        )}
        
        <div className="flex items-center">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className={`flex-1 border ${containsPHI ? 'border-amber-500' : 'border-gray-300'} rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
            rows={3}
          />
          <button
            type="submit"
            className={`ml-3 px-4 py-2 rounded-lg flex items-center justify-center ${
              newMessage.trim() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'
            } text-white transition-colors`}
            disabled={!newMessage.trim()}
          >
            <FaPaperPlane />
          </button>
        </div>
      </form>
    </div>
  );
} 