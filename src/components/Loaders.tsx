import React from 'react';
import { HeartbeatIcon } from './MedicalIcons';

export const PulseLoader: React.FC = () => {
  return (
    <div className="pulse-loader">
      <div className="relative h-3 w-full max-w-md">
        <div className="absolute inset-0 bg-neutral-200 rounded-full"></div>
        <div className="absolute h-full w-full animate-pulse">
          <div className="h-full bg-gradient-to-r from-[var(--primary)]/60 via-[var(--primary)] to-[var(--primary)]/60 rounded-full"></div>
        </div>
        <div className="absolute top-0 -translate-y-full left-0 w-3 h-3 bg-[var(--primary)] rounded-full animate-bounce"></div>
      </div>
    </div>
  );
};

export const HeartbeatLoader: React.FC<{ className?: string }> = ({ className = "text-primary" }) => {
  return (
    <div className="flex justify-center items-center py-8">
      <HeartbeatIcon className={`w-10 h-10 ${className} animate-heartbeat`} />
    </div>
  );
};

export const MedicalSpinner: React.FC<{ size?: string; color?: string }> = ({ 
  size = "w-12 h-12", 
  color = "text-primary" 
}) => {
  return (
    <div className="flex justify-center items-center py-8">
      <div className={`${size} ${color} relative`}>
        <div className="absolute inset-0 rounded-full border-4 border-current border-solid opacity-20"></div>
        <div className="absolute inset-0 rounded-full border-4 border-current border-solid opacity-20 animate-ping"></div>
        <div className="absolute inset-0 rounded-full border-t-4 border-current border-solid animate-spin"></div>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 24 24">
          <path
            className="opacity-60"
            fill="currentColor"
            d="M12 5V3M12 21v-2M3 12h2M19 12h2M18.364 18.364l-1.414-1.414M7.05 7.05L5.636 5.636M18.364 5.636l-1.414 1.414M7.05 16.95l-1.414 1.414"
          />
        </svg>
      </div>
    </div>
  );
};

export const SkeletonLoader: React.FC = () => {
  return (
    <div className="space-y-4 p-4">
      <div className="h-6 bg-neutral-200 rounded animate-pulse w-3/4"></div>
      <div className="h-4 bg-neutral-200 rounded animate-pulse w-1/2"></div>
      <div className="h-24 bg-neutral-200 rounded animate-pulse"></div>
      <div className="grid grid-cols-2 gap-4 pt-2">
        <div className="h-10 bg-neutral-200 rounded animate-pulse"></div>
        <div className="h-10 bg-neutral-200 rounded animate-pulse"></div>
      </div>
    </div>
  );
};

export const DoctorCardSkeleton: React.FC = () => {
  return (
    <div className="doctor-card-enhanced animate-pulse">
      <div className="doctor-image-container bg-neutral-200"></div>
      <div className="p-5 space-y-4">
        <div className="h-6 bg-neutral-200 rounded w-3/4"></div>
        <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
        <div className="h-4 bg-neutral-200 rounded w-full"></div>
        <div className="flex justify-between items-center">
          <div className="h-8 bg-neutral-200 rounded w-1/4"></div>
          <div className="h-6 bg-neutral-200 rounded-full w-1/4"></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-10 bg-neutral-200 rounded"></div>
          <div className="h-10 bg-neutral-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}; 