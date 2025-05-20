'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  FileText, 
  Activity, 
  Settings,
  LogOut,
  Clock,
  MessageSquare,
  Stethoscope,
  Receipt,
  PieChart,
  Menu,
  X
} from 'lucide-react';

export function DoctorClient() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };
  
  const menuItems = [
    { 
      href: '/doctor', 
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5 text-gray-500" />,
      mobileIcon: <LayoutDashboard className="h-6 w-6" />
    },
    { 
      href: '/doctor/appointments', 
      label: 'Appointments',
      icon: <CalendarDays className="h-5 w-5 text-gray-500" />,
      mobileIcon: <CalendarDays className="h-6 w-6" />
    },
    { 
      href: '/doctor/patients', 
      label: 'Patients',
      icon: <Users className="h-5 w-5 text-gray-500" />,
      mobileIcon: <Users className="h-6 w-6" />
    },
    { 
      href: '/doctor/consultations', 
      label: 'Consultations',
      icon: <MessageSquare className="h-5 w-5 text-gray-500" />,
      mobileIcon: <MessageSquare className="h-6 w-6" />
    },
    { 
      href: '/doctor/schedule', 
      label: 'Schedule',
      icon: <Clock className="h-5 w-5 text-gray-500" />,
      mobileIcon: <Clock className="h-6 w-6" />
    },
    { 
      href: '/doctor/prescriptions', 
      label: 'Prescriptions',
      icon: <FileText className="h-5 w-5 text-gray-500" />,
      mobileIcon: <FileText className="h-6 w-6" />
    },
    { 
      href: '/doctor/medical-records', 
      label: 'Medical Records',
      icon: <Activity className="h-5 w-5 text-gray-500" />,
      mobileIcon: <Activity className="h-6 w-6" />
    },
    { 
      href: '/doctor/billing', 
      label: 'Billing',
      icon: <Receipt className="h-5 w-5 text-gray-500" />,
      mobileIcon: <Receipt className="h-6 w-6" />
    },
    { 
      href: '/doctor/analytics', 
      label: 'Analytics',
      icon: <PieChart className="h-5 w-5 text-gray-500" />,
      mobileIcon: <PieChart className="h-6 w-6" />
    },
    { 
      href: '/doctor/profile', 
      label: 'Profile',
      icon: <Settings className="h-5 w-5 text-gray-500" />,
      mobileIcon: <Settings className="h-6 w-6" />
    }
  ];
  
  return (
    <>
      {/* Mobile Header with hamburger menu */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white shadow-sm z-50 px-4 py-3 flex justify-between items-center">
        <Link href="/doctor" className="flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-blue-600" />
          <span className="font-bold text-lg">Doctor Portal</span>
        </Link>
        
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="fixed top-0 bottom-0 left-0 w-64 bg-white shadow-lg z-50 p-4 pt-16" onClick={e => e.stopPropagation()}>
            <nav className="flex flex-col gap-1">
              {menuItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md ${
                    isActive(item.href) 
                      ? 'bg-blue-50 text-blue-700 font-medium' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
              
              <form action="/api/auth/signout" method="post" className="mt-4 pt-4 border-t">
                <button type="submit" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-red-50 text-gray-700 hover:text-red-700 font-medium transition-colors">
                  <LogOut className="h-5 w-5 text-gray-500" />
                  <span>Logout</span>
                </button>
              </form>
            </nav>
          </div>
        </div>
      )}
      
      {/* Mobile bottom tabs */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="grid grid-cols-4 gap-1">
          {menuItems.slice(0, 4).map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-2 ${
                isActive(item.href) ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              {item.mobileIcon}
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Extra padding for mobile view */}
      <div className="md:hidden h-14 w-full"></div>
      <div className="md:hidden h-16 w-full mt-auto"></div>
    </>
  );
} 