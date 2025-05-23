// src/components/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { useMessages } from '@/hooks/useMessages';
import { MessageSquare } from 'lucide-react';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const NavLink = ({ href, children, icon }: NavLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  return (
    <Link 
      href={href}
      className={`px-4 py-2 rounded-md transition-colors font-medium ${
        isActive 
          ? "bg-primary/10 text-primary" 
          : "hover:bg-secondary text-foreground/80 hover:text-foreground"
      }`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </Link>
  );
};

// Doctor-specific NavLink with blue theme
const DoctorNavLink = ({ href, children }: NavLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  return (
    <Link 
      href={href}
      className={`px-4 py-2 rounded-md transition-colors font-medium ${
        isActive 
          ? "bg-blue-100 text-blue-700" 
          : "hover:bg-blue-50 text-foreground/80 hover:text-blue-700"
      }`}
    >
      {children}
    </Link>
  );
};

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const isDoctor = profile?.role === "doctor";
  
  const { unreadCount } = useMessages({
    fetchUserDetails: false,
    autoRefresh: false
  });

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  return (
    <header className={`border-b sticky top-0 z-50 backdrop-blur-sm shadow-sm ${isDoctor ? "bg-blue-50/95 border-blue-200" : "bg-background/95 app-border"}`}>
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl flex items-center gap-1.5">
          {isDoctor ? (
            // Doctor-specific logo with stethoscope icon
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="h-6 w-6 text-blue-600"
            >
              <path d="M19 15v-3a8 8 0 0 0-8-8 8 8 0 0 0-8 8v3"></path>
              <circle cx="12" cy="15" r="1"></circle>
              <path d="M8 16v2a4 4 0 0 0 8 0v-2"></path>
            </svg>
          ) : (
            // Regular calendar icon for patients
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="h-6 w-6 text-primary"
            >
              <path d="M8 2v4" />
              <path d="M16 2v4" />
              <path d="M3 10h18" />
              <path d="M4 6h16a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" />
              <path d="M10 16h4" />
            </svg>
          )}
          <span>Doc<span className={isDoctor ? "text-blue-600" : "text-primary"}>ToProche</span></span>
          {isDoctor && <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">Doctor Portal</span>}
        </Link>
        
        <nav className="hidden md:flex items-center gap-1">
          {isDoctor ? (
            // Doctor navigation links
            <>
              <DoctorNavLink href="/doctor">Dashboard</DoctorNavLink>
              <DoctorNavLink href="/doctor/analytics">Analytics</DoctorNavLink>
              <DoctorNavLink href="/doctor/appointments">Appointments</DoctorNavLink>
              <DoctorNavLink href="/doctor/patients">Patients</DoctorNavLink>
              <DoctorNavLink href="/doctor/schedule">Schedule</DoctorNavLink>
              <DoctorNavLink href="/doctor/consultations">Consultations</DoctorNavLink>
              <DoctorNavLink href="/messaging">
                <span className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Messages
                  {unreadCount > 0 && (
                    <span className="ml-1 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[16px] text-center">
                      {unreadCount}
                    </span>
                  )}
                </span>
              </DoctorNavLink>
            </>
          ) : (
            // Patient/regular navigation links
            <>
              <NavLink href="/">Home</NavLink>
              <NavLink href="/doctors">Find Doctors</NavLink>
              <NavLink href="/appointments">My Appointments</NavLink>
              <NavLink href="/health-records">Health Records</NavLink>
              <NavLink href="/messaging">
                <span className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Messages
                  {unreadCount > 0 && (
                    <span className="ml-1 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[16px] text-center">
                      {unreadCount}
                    </span>
                  )}
                </span>
              </NavLink>
              <NavLink href="/about">About</NavLink>
              <NavLink href="/contact">Contact</NavLink>
            </>
          )}
        </nav>
        
        <div className="flex items-center gap-3">
          {isDoctor ? (
            // Doctor-specific quick action
            <Link 
              href="/doctor/consultations/new" 
              className="btn-secondary flex items-center gap-1.5 bg-blue-600 text-white hover:bg-blue-700"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="h-4 w-4"
              >
                <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z"></path>
                <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"></path>
              </svg>
              Start Consultation
            </Link>
          ) : (
            // Patient/regular quick action
            <Link 
              href="/book-appointment" 
              className="btn-secondary flex items-center gap-1.5"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="h-4 w-4"
              >
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z" />
                <path d="M12 11h4" />
                <path d="M12 16h4" />
                <path d="M8 11h.01" />
                <path d="M8 16h.01" />
              </svg>
              Book Appointment
            </Link>
          )}
          
          {user ? (
            <div className="relative">
              <button 
                onClick={toggleProfileMenu}
                className={`flex items-center gap-2 p-1 rounded-full transition-colors ${isDoctor ? "hover:bg-blue-100" : "hover:bg-secondary"}`}
              >
                <div className={`w-8 h-8 rounded-full ${isDoctor ? "bg-blue-600" : "bg-primary"} text-white flex items-center justify-center overflow-hidden`}>
                  {profile?.profile_image ? (
                    <img 
                      src={profile.profile_image} 
                      alt={profile.full_name || "User"} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium">
                      {profile?.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
                    </span>
                  )}
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-100">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium">{profile?.full_name || "User"}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    {isDoctor && (
                      <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full inline-block mt-1">Doctor</span>
                    )}
                  </div>
                  
                  {isDoctor ? (
                    // Doctor profile menu items
                    <>
                      <Link
                        href="/doctor"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Doctor Dashboard
                      </Link>
                      <Link
                        href="/doctor/analytics"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Analytics
                      </Link>
                      <Link
                        href="/doctor/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Practice Profile
                      </Link>
                      <Link
                        href="/doctor/schedule"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Manage Schedule
                      </Link>
                      <Link
                        href="/doctor/earnings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Earnings & Payments
                      </Link>
                      <Link
                        href="/doctor/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Account Settings
                      </Link>
                    </>
                  ) : (
                    // Patient/regular profile menu items
                    <>
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <NavLink href="/messaging" >
                        Messages
                        {unreadCount > 0 && (
                          <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1 min-w-[20px] text-center">
                            {unreadCount}
                          </span>
                        )}
                      </NavLink>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Profile Settings
                      </Link>
                      <Link
                        href="/appointments"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        My Appointments
                      </Link>
                    </>
                  )}
                  
                  <button
                    onClick={() => {
                      signOut();
                      setIsProfileMenuOpen(false);
                    }}
                    className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left border-t border-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link 
                href="/auth/login" 
                className="btn-ghost text-foreground/90"
              >
                Login
              </Link>
              <Link 
                href="/auth/register" 
                className="btn-primary"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}