"use client";

import { useState } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { FaTrash, FaCheck, FaCheckDouble, FaExclamationTriangle } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface MessageBubbleProps {
  id: string;
  content: string;
  sentAt: string;
  isCurrentUser: boolean;
  senderName: string;
  senderImage?: string;
  read: boolean;
  containsPHI?: boolean;
  onDelete?: (id: string) => void;
}

export function MessageBubble({
  id,
  content,
  sentAt,
  isCurrentUser,
  senderName,
  senderImage,
  read,
  containsPHI = false,
  onDelete
}: MessageBubbleProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const handleDeleteClick = () => {
    if (!isCurrentUser) return;
    setShowDeleteConfirm(true);
  };
  
  const handleDeleteConfirm = () => {
    if (onDelete) {
      onDelete(id);
    }
    setShowDeleteConfirm(false);
  };
  
  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };
  
  const formattedTime = format(new Date(sentAt), 'h:mm a');
  const formattedDate = format(new Date(sentAt), 'MMM d');
  
  const placeholderImage = "https://via.placeholder.com/40";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex w-full mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isCurrentUser && (
        <div className="flex-shrink-0 mr-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden">
            <Image 
              src={senderImage || placeholderImage}
              alt={senderName}
              fill
              sizes="40px"
              style={{ objectFit: 'cover' }}
            />
          </div>
        </div>
      )}
      
      <div className={`max-w-[70%] ${isCurrentUser ? 'order-1' : 'order-2'}`}>
        {!isCurrentUser && (
          <div className="text-xs text-gray-500 ml-1 mb-1">{senderName}</div>
        )}
        
        <div 
          className={`relative px-4 py-3 rounded-lg ${
            isCurrentUser 
              ? 'bg-blue-600 text-white rounded-br-none' 
              : 'bg-gray-100 text-gray-800 rounded-bl-none'
          } ${containsPHI ? 'border-2 border-amber-500' : ''}`}
        >
          {content}
          
          {containsPHI && (
            <div className="absolute -right-1 -top-1 bg-amber-500 rounded-full p-1 text-white">
              <FaExclamationTriangle size={12} />
            </div>
          )}
          
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs opacity-70">{`${formattedTime} · ${formattedDate}`}</span>
            {isCurrentUser && (
              <div className="flex items-center">
                {read ? (
                  <FaCheckDouble size={12} className="ml-1 opacity-70" />
                ) : (
                  <FaCheck size={12} className="ml-1 opacity-70" />
                )}
              </div>
            )}
          </div>
        </div>
        
        {isCurrentUser && onDelete && !showDeleteConfirm && (
          <button 
            onClick={handleDeleteClick}
            className="text-gray-400 hover:text-red-500 transition-colors text-xs mt-1 flex items-center justify-end"
            aria-label="Delete message"
          >
            <FaTrash size={12} className="mr-1" /> Delete
          </button>
        )}
        
        {showDeleteConfirm && (
          <div className="flex justify-end mt-1 space-x-2">
            <button 
              onClick={handleDeleteConfirm}
              className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
            <button 
              onClick={handleDeleteCancel}
              className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
      
      {isCurrentUser && (
        <div className="flex-shrink-0 ml-3 order-2">
          <div className="relative w-10 h-10 rounded-full overflow-hidden">
            <Image 
              src={senderImage || placeholderImage}
              alt={senderName}
              fill
              sizes="40px"
              style={{ objectFit: 'cover' }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
} 