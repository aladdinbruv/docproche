'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { 
  Calendar, Users, DollarSign, Star, 
  TrendingUp, AlertCircle, RefreshCw, WifiOff
} from 'lucide-react';
import { useDoctorDashboard } from '@/hooks';
import { useNetworkStatus } from '@/components/NetworkStatusProvider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getUserFriendlyErrorMessage } from '@/utils/errorUtils';

export function DoctorDashboard() {
  const { analytics, patients, paymentSummary, loading, error, refreshData } = useDoctorDashboard();
  const { isOnline } = useNetworkStatus();

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'long'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
          <button 
            onClick={refreshData}
            className="btn btn-primary flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-300 rounded w-1/4"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-gray-300"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded w-full"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
          <button 
            onClick={refreshData}
            className="btn btn-primary flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
          <div className="flex items-center gap-2 text-red-700 mb-2">
            <AlertCircle className="h-5 w-5" />
            <h2 className="font-semibold">Error Loading Dashboard</h2>
          </div>
          <p className="text-red-600">{error}</p>
          <p className="text-sm text-red-500 mt-2">
            Please try refreshing or contact support if the issue persists.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4">
      {/* Top stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Appointments card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">
                {analytics?.total_appointments ?? 0}
              </div>
              <div className="p-2 bg-primary/10 text-primary rounded-full">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
            <div className="flex justify-between mt-3 text-sm">
              <div>
                <span className="text-muted-foreground">Pending: </span>
                <span className="font-medium">{analytics?.pending_appointments ?? 0}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Completed: </span>
                <span className="font-medium">{analytics?.completed_appointments ?? 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patients card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Patients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">
                {analytics?.total_patients ?? 0}
              </div>
              <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <Link 
                href="/doctor/patients" 
                className="text-sm text-primary hover:underline inline-block"
              >
                View all patients →
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Revenue card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">
                {formatCurrency(analytics?.total_revenue ?? 0)}
              </div>
              <div className="p-2 bg-green-100 text-green-600 rounded-full">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-center text-sm">
                <TrendingUp className="text-green-500 mr-1 h-4 w-4" />
                <span className="text-muted-foreground">This month: </span>
                <span className="font-medium ml-1">
                  {formatCurrency(analytics?.monthly_revenue ?? 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reviews card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Latest Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {analytics?.latest_reviews && analytics.latest_reviews.length > 0 ? (
                  <>
                    <span className="text-3xl font-bold mr-2">
                      {analytics.latest_reviews[0]?.rating || 0}
                    </span>
                    <div className="flex text-yellow-400">
                      {Array(5).fill(0).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < (analytics.latest_reviews[0]?.rating || 0) ? 'fill-current' : ''}`} 
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <span className="text-3xl font-bold">N/A</span>
                )}
              </div>
              <div className="p-2 bg-yellow-100 text-yellow-600 rounded-full">
                <Star className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <Link 
                href="/doctor/reviews" 
                className="text-sm text-primary hover:underline inline-block"
              >
                View all reviews →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming appointments */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Upcoming Appointments</CardTitle>
                <Link href="/doctor/appointments" className="text-sm text-primary hover:underline">
                  View all
                </Link>
              </div>
              <CardDescription>
                Your schedule for the coming days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics?.recent_appointments && analytics.recent_appointments.length > 0 ? (
                <div className="space-y-4">
                  {analytics.recent_appointments
                    .filter(apt => apt.status === 'confirmed' || apt.status === 'pending')
                    .map(appointment => (
                      <div 
                        key={appointment.id} 
                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{appointment.patient.full_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {appointment.consultation_type === 'video' 
                                ? 'Video Consultation' 
                                : 'In-person Visit'
                              }
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{formatDate(appointment.date)}</p>
                            <p className="text-sm text-muted-foreground">{appointment.time_slot}</p>
                          </div>
                        </div>
                        <div className="mt-2 flex justify-between items-center">
                          <span 
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${appointment.status === 'confirmed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                              }`
                            }
                          >
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                          <Link 
                            href={`/doctor/appointments/${appointment.id}`} 
                            className="text-sm text-primary hover:underline"
                          >
                            View details
                          </Link>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">No upcoming appointments</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent payments */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
              <CardDescription>
                Payment activity for your consultations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {paymentSummary?.recent_payments && paymentSummary.recent_payments.length > 0 ? (
                <div className="space-y-4">
                  {paymentSummary.recent_payments.map(payment => (
                    <div 
                      key={payment.id} 
                      className="p-3 border rounded-lg"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{payment.patient?.full_name}</span>
                        <span className={`text-sm font-medium ${
                          payment.status === 'successful' ? 'text-green-600' : 
                          payment.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(payment.amount)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{new Date(payment.payment_date).toLocaleDateString()}</span>
                        <span className={`px-2 py-0.5 rounded-full ${
                          payment.status === 'successful' ? 'bg-green-100 text-green-800' : 
                          payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">No recent payments</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t pt-4 px-6">
              <div className="w-full flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-lg font-bold">{formatCurrency(paymentSummary?.total_revenue ?? 0)}</p>
                </div>
                <Link 
                  href="/doctor/billing" 
                  className="text-sm text-primary hover:underline"
                >
                  View all payments →
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Patient Overview */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Patients</CardTitle>
            <Link href="/doctor/patients" className="text-sm text-primary hover:underline">
              View all patients
            </Link>
          </div>
          <CardDescription>
            Overview of your most recent patients
          </CardDescription>
        </CardHeader>
        <CardContent>
          {patients && patients.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Patient</th>
                    <th className="text-left py-3 px-4 font-medium">Email</th>
                    <th className="text-left py-3 px-4 font-medium">Last Visit</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Total Visits</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.slice(0, 5).map(patient => (
                    <tr key={patient.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 mr-3 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            {patient.profile_image ? (
                              <img 
                                src={patient.profile_image} 
                                alt={patient.full_name} 
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-medium">
                                {patient.full_name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <span className="font-medium">{patient.full_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{patient.email}</td>
                      <td className="py-3 px-4 text-sm">{formatDate(patient.latest_appointment.date)}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${patient.latest_appointment.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800' : 
                            patient.latest_appointment.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800' :
                            patient.latest_appointment.status === 'completed'
                            ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`
                        }>
                          {patient.latest_appointment.status.charAt(0).toUpperCase() + patient.latest_appointment.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">{patient.appointment_count}</td>
                      <td className="py-3 px-4">
                        <Link 
                          href={`/doctor/patients/${patient.id}`} 
                          className="text-sm text-primary hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">No patients yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 