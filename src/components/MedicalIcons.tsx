import React from 'react';

interface IconProps {
  className?: string;
}

export const HeartbeatIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const PillIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.5 21.5C8 19 3 14 3 9C3 5.5 5.5 3 9 3C12.5 3 21.5 10.5 21.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M13 13.5C14 14.5 14 16 13 17C12 18 10.5 18 9.5 17L8 15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const StethoscopeIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.5 13C6.5 13 6.5 12 6.5 11V5C6.5 3 9 3 9 5V11C9 15 4 16.5 4 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M14.5 13C12.5 13 12.5 12 12.5 11V5C12.5 3 10 3 10 5V11C10 15 15 16.5 15 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="21" r="2" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

export const CalendarMedicalIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 4H20C20.5523 4 21 4.44772 21 5V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V5C3 4.44772 3.44772 4 4 4Z" stroke="currentColor" strokeWidth="2"/>
    <path d="M10 16H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const MedicalCrossIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="7" y="3" width="10" height="18" rx="1" stroke="currentColor" strokeWidth="2"/>
    <path d="M7 8H17" stroke="currentColor" strokeWidth="2"/>
    <path d="M7 16H17" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 3V21" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

export const DoctorIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
    <path d="M4 21V19C4 16.7909 5.79086 15 8 15H16C18.2091 15 20 16.7909 20 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M10 11H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 9V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const HospitalIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M5 21V5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V21" stroke="currentColor" strokeWidth="2"/>
    <path d="M9 7H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M9 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 7V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
); 