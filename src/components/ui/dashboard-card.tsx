import React from 'react';
import Link from 'next/link';

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}

export function DashboardCard({ title, description, icon, href }: DashboardCardProps) {
  return (
    <Link 
      href={href}
      className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col"
    >
      <div className="flex items-center mb-4">
        <div className="p-2 rounded-full bg-blue-50 text-blue-600 mr-3">
          {icon}
        </div>
        <h3 className="font-semibold text-lg">{title}</h3>
      </div>
      <p className="text-gray-600 text-sm">{description}</p>
    </Link>
  );
} 