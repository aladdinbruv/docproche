"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClientComponentClient } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DollarSign, CreditCard, Calendar, ChevronDown, 
  Download, Filter, ArrowUpRight, FileText, PlusCircle 
} from 'lucide-react';
import { format, parseISO, isThisMonth, isThisYear } from 'date-fns';

// Payment interface matching database schema
interface Payment {
  id: string;
  appointment_id: string;
  amount: number;
  transaction_id: string;
  status: 'pending' | 'successful' | 'failed';
  payment_date: string;
  patient?: {
    id: string;
    full_name: string;
    email?: string;
  };
  appointment?: {
    date: string;
    time_slot: string;
    consultation_type: string;
    patient_id: string;
    doctor_id: string;
  };
}

export default function DoctorBillingPage() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<string | null>(null);
  
  // Get all payment records with details
  useEffect(() => {
    const fetchPaymentRecords = async () => {
      if (!user || !profile) return;
      
      setIsLoading(true);
      const supabase = createClientComponentClient();
      
      try {
        // First get all appointment IDs for this doctor
        const { data: appointments, error: appointmentsError } = await supabase
          .from('appointments')
          .select('id')
          .eq('doctor_id', profile.id);
          
        if (appointmentsError) throw appointmentsError;
        
        // Get associated payments and include the appointment and patient details
        if (appointments && appointments.length > 0) {
          const appointmentIds = appointments.map(apt => apt.id);
          
          const { data, error } = await supabase
            .from('payments')
            .select(`
              *,
              appointment:appointment_id(
                date, 
                time_slot, 
                consultation_type, 
                patient_id, 
                doctor_id,
                patient:patient_id(id, full_name, email)
              )
            `)
            .in('appointment_id', appointmentIds)
            .order('payment_date', { ascending: false });
            
          if (error) throw error;
          
          // Transform the data to extract patient info
          const processedPayments = data?.map(payment => ({
            ...payment,
            patient: payment.appointment?.patient
          })) || [];
          
          setAllPayments(processedPayments);
          setPayments(processedPayments);
        } else {
          setAllPayments([]);
          setPayments([]);
        }
      } catch (error) {
        console.error('Error fetching payment records:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPaymentRecords();
  }, [user, profile]);
  
  // Filter payments based on filters
  useEffect(() => {
    let filteredPayments = [...allPayments];
    
    // Apply search filter
    if (searchQuery) {
      filteredPayments = filteredPayments.filter(payment => 
        payment.patient?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.transaction_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.amount.toString().includes(searchQuery)
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      filteredPayments = filteredPayments.filter(payment => payment.status === statusFilter);
    }
    
    // Apply time filter
    if (timeFilter) {
      filteredPayments = filteredPayments.filter(payment => {
        const paymentDate = parseISO(payment.payment_date);
        
        if (timeFilter === 'month') {
          return isThisMonth(paymentDate);
        } else if (timeFilter === 'year') {
          return isThisYear(paymentDate);
        }
        
        return true;
      });
    }
    
    setPayments(filteredPayments);
  }, [searchQuery, statusFilter, timeFilter, allPayments]);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };
  
  // Format time for display
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  // Calculate earnings statistics
  const calculateStats = () => {
    const totalEarnings = allPayments.reduce((sum, payment) => 
      payment.status === 'successful' ? sum + payment.amount : sum, 0
    );
    
    const monthlyEarnings = allPayments
      .filter(payment => payment.status === 'successful' && isThisMonth(parseISO(payment.payment_date)))
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    const pendingPayments = allPayments
      .filter(payment => payment.status === 'pending')
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    const successfulPaymentsCount = allPayments.filter(payment => payment.status === 'successful').length;
    
    return {
      totalEarnings,
      monthlyEarnings,
      pendingPayments,
      successfulPaymentsCount
    };
  };
  
  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-600 border-b-blue-100 border-l-blue-100 border-r-blue-100 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading billing data...</p>
        </div>
      </div>
    );
  }
  
  // Get the statistics
  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-blue-600 text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-2">Billing & Earnings</h1>
          <p className="text-blue-100">Manage your payments and financial records</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 mt-6">
        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Earnings</p>
                  <h3 className="text-3xl font-bold mt-2">${stats.totalEarnings.toFixed(2)}</h3>
                </div>
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">This Month</p>
                  <h3 className="text-3xl font-bold mt-2">${stats.monthlyEarnings.toFixed(2)}</h3>
                </div>
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <Calendar className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending Payments</p>
                  <h3 className="text-3xl font-bold mt-2">${stats.pendingPayments.toFixed(2)}</h3>
                </div>
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                  <CreditCard className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Transactions</p>
                  <h3 className="text-3xl font-bold mt-2">{stats.successfulPaymentsCount}</h3>
                </div>
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <ArrowUpRight className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Filters and Actions */}
        <div className="mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative col-span-2">
                  <Input
                    className="pl-10"
                    placeholder="Search by patient name or transaction ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                
                <div>
                  <select
                    className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={statusFilter || ''}
                    onChange={(e) => setStatusFilter(e.target.value || null)}
                  >
                    <option value="">All Statuses</option>
                    <option value="successful">Successful</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                
                <div>
                  <select
                    className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={timeFilter || ''}
                    onChange={(e) => setTimeFilter(e.target.value || null)}
                  >
                    <option value="">All Time</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-500">
                  Showing {payments.length} of {allPayments.length} payments
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Invoice
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Payment Records */}
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>
              View and manage all your payment transactions
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {payments.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">No payment records found</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  {searchQuery || statusFilter || timeFilter
                    ? "No payments match your current filters. Try adjusting your search criteria."
                    : "You haven't received any payments yet."}
                </p>
                <Button className="mt-4">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Manual Invoice
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Patient</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Transaction ID</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm">
                          <div className="font-medium">{payment.patient?.full_name || 'Unknown'}</div>
                          <div className="text-gray-500 text-xs">
                            {payment.appointment?.consultation_type || 'N/A'} appointment
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <div>{formatDate(payment.payment_date)}</div>
                          <div className="text-gray-500 text-xs">{formatTime(payment.payment_date)}</div>
                        </td>
                        <td className="px-4 py-4 font-medium">${payment.amount.toFixed(2)}</td>
                        <td className="px-4 py-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            payment.status === 'successful' ? 'bg-green-100 text-green-800' : 
                            payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <span className="font-mono text-xs">{payment.transaction_id.slice(0, 12)}...</span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 