'use client';

import React from 'react';
import { AuthGuard, DoctorDashboard } from '@/components';
import { SupabaseChecker } from '@/components/SupabaseChecker';

export default function DoctorDashboardPage() {
  return (
    <AuthGuard requiredRole="doctor">
      <div className="container mx-auto px-4 py-6">
        <SupabaseChecker />
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your appointments, patients, and practice in one place
          </p>
        </div>
        
        <DoctorDashboard />
      </div>
    </AuthGuard>
  );
} 