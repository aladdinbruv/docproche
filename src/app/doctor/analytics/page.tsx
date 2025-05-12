"use client";

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAppointments } from '@/hooks/useAppointments';
import { usePayments } from '@/hooks/usePayments';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Activity, Users, DollarSign, Calendar, 
  ArrowUp, ArrowDown, Filter, Download 
} from 'lucide-react';
import { format, subMonths, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function DoctorAnalyticsPage() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const [timeRange, setTimeRange] = useState('6months');
  const [filterType, setFilterType] = useState('all');
  
  // Fetch appointments data
  const { 
    appointments, 
    loading: appointmentsLoading 
  } = useAppointments(
    profile?.id || user?.id || '', 
    'doctor', 
    { includePatient: true }
  );
  
  // Fetch payment data
  const { payments, isLoading: paymentsLoading } = usePayments();
  
  // Generate mock data for demonstration if real data is not available
  const getTimeRangeData = () => {
    const now = new Date();
    const months = timeRange === '6months' ? 6 : (timeRange === '3months' ? 3 : 12);
    
    // For appointments statistics
    const monthlyData = Array.from({ length: months }, (_, i) => {
      const monthDate = subMonths(now, months - i - 1);
      const monthName = format(monthDate, 'MMM');
      
      // Filter appointments for this month
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      const monthAppointments = appointments?.filter(apt => {
        if (!apt.date) return false;
        const aptDate = parseISO(apt.date);
        return isWithinInterval(aptDate, { start: monthStart, end: monthEnd });
      }) || [];
      
      // Calculate completed and cancelled appointments
      const completed = monthAppointments.filter(apt => apt.status === 'completed').length;
      const cancelled = monthAppointments.filter(apt => apt.status === 'cancelled').length;
      const pending = monthAppointments.filter(apt => apt.status === 'pending').length;
      
      return {
        name: monthName,
        Completed: completed,
        Cancelled: cancelled,
        Pending: pending,
        Total: monthAppointments.length,
        // Mock revenue for demonstration
        Revenue: (completed * 150) + (pending * 30)
      };
    });
    
    return monthlyData;
  };
  
  // Calculate key metrics
  const calculateMetrics = () => {
    const monthlyData = getTimeRangeData();
    
    // Total appointments
    const totalAppointments = monthlyData.reduce((sum, month) => sum + month.Total, 0);
    
    // Completed appointments
    const completedAppointments = monthlyData.reduce((sum, month) => sum + month.Completed, 0);
    
    // Completion rate
    const completionRate = totalAppointments > 0 
      ? ((completedAppointments / totalAppointments) * 100).toFixed(1) 
      : '0';
    
    // Total revenue
    const totalRevenue = monthlyData.reduce((sum, month) => sum + month.Revenue, 0);
    
    // Patient count (unique patient IDs)
    const uniquePatients = new Set(
      appointments?.map(apt => apt.patient_id) || []
    ).size;
    
    return {
      totalAppointments,
      completedAppointments,
      completionRate,
      totalRevenue,
      uniquePatients
    };
  };
  
  // Prepare appointmnt type distribution data for pie chart
  const appointmentTypeData = () => {
    const types = appointments?.reduce((acc, apt) => {
      const type = apt.appointment_type || 'General Consultation';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};
    
    return Object.entries(types).map(([name, value]) => ({ name, value }));
  };
  
  // Get the metrics
  const metrics = calculateMetrics();
  
  // Prepare data
  const monthlyData = getTimeRangeData();
  const appointmentTypes = appointmentTypeData();
  
  // Loading state
  if (authLoading || appointmentsLoading || paymentsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-600 border-b-blue-100 border-l-blue-100 border-r-blue-100 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-blue-600 text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-blue-100">Track your practice performance and patient metrics</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 mt-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-2">
            <Select
              value={timeRange}
              onValueChange={(value) => setTimeRange(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="12months">Last 12 Months</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Appointments</p>
                  <h3 className="text-3xl font-bold mt-2">{metrics.totalAppointments}</h3>
                  <div className="flex items-center mt-1 text-sm">
                    <ArrowUp className="h-4 w-4 text-emerald-500 mr-1" />
                    <span className="text-emerald-500 font-medium">12%</span>
                    <span className="text-gray-500 ml-1">vs last period</span>
                  </div>
                </div>
                <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
                  <Calendar className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                  <h3 className="text-3xl font-bold mt-2">{metrics.completionRate}%</h3>
                  <div className="flex items-center mt-1 text-sm">
                    <ArrowUp className="h-4 w-4 text-emerald-500 mr-1" />
                    <span className="text-emerald-500 font-medium">3.2%</span>
                    <span className="text-gray-500 ml-1">vs last period</span>
                  </div>
                </div>
                <div className="bg-green-100 text-green-600 p-3 rounded-full">
                  <Activity className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <h3 className="text-3xl font-bold mt-2">${metrics.totalRevenue}</h3>
                  <div className="flex items-center mt-1 text-sm">
                    <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                    <span className="text-red-500 font-medium">2.1%</span>
                    <span className="text-gray-500 ml-1">vs last period</span>
                  </div>
                </div>
                <div className="bg-purple-100 text-purple-600 p-3 rounded-full">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Patients</p>
                  <h3 className="text-3xl font-bold mt-2">{metrics.uniquePatients}</h3>
                  <div className="flex items-center mt-1 text-sm">
                    <ArrowUp className="h-4 w-4 text-emerald-500 mr-1" />
                    <span className="text-emerald-500 font-medium">8.4%</span>
                    <span className="text-gray-500 ml-1">vs last period</span>
                  </div>
                </div>
                <div className="bg-amber-100 text-amber-600 p-3 rounded-full">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts section */}
        <Tabs defaultValue="appointments" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="appointments">Appointment Trends</TabsTrigger>
            <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
            <TabsTrigger value="patients">Patient Statistics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="appointments">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle>Appointment Trends</CardTitle>
                  <CardDescription>Monthly appointment statistics</CardDescription>
                </CardHeader>
                <CardContent className="pt-3">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={monthlyData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Completed" stackId="a" fill="#4ade80" />
                        <Bar dataKey="Pending" stackId="a" fill="#60a5fa" />
                        <Bar dataKey="Cancelled" stackId="a" fill="#f87171" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Appointment Types</CardTitle>
                  <CardDescription>Distribution by type</CardDescription>
                </CardHeader>
                <CardContent className="pt-3">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={appointmentTypes}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {appointmentTypes.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="revenue">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Monthly revenue analytics</CardDescription>
              </CardHeader>
              <CardContent className="pt-3">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={monthlyData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`$${value}`, 'Revenue']}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="Revenue" 
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }} 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="patients">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Patient Growth</CardTitle>
                <CardDescription>New patients over time</CardDescription>
              </CardHeader>
              <CardContent className="pt-3">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={monthlyData.map((month, index) => ({
                        ...month,
                        'New Patients': Math.floor(Math.random() * 10) + 1, // Mock data
                        'Return Patients': Math.floor(Math.random() * 15) + 5, // Mock data
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="New Patients" 
                        stroke="#0088FE" 
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="Return Patients" 
                        stroke="#00C49F" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Performance Analytics */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Performance Metrics</h2>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Efficiency Metrics</CardTitle>
              <CardDescription>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Appointment Completion Rate</span>
                    <span className="text-sm font-medium">{metrics.completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${metrics.completionRate}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Patient Satisfaction</span>
                    <span className="text-sm font-medium">92%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-green-500 h-2.5 rounded-full" 
                      style={{ width: '92%' }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Follow-up Booking Rate</span>
                    <span className="text-sm font-medium">63%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-amber-500 h-2.5 rounded-full" 
                      style={{ width: '63%' }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Average Response Time</span>
                    <span className="text-sm font-medium">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-purple-500 h-2.5 rounded-full" 
                      style={{ width: '85%' }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}