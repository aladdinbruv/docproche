import React from 'react';
import Link from 'next/link';
import { FaCreditCard, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { MdPayment, MdAccessTime } from 'react-icons/md';

interface Payment {
  id: string;
  amount: number;
  status: 'pending' | 'successful' | 'failed';
  payment_date: string;
  appointment_id: string;
}

interface AppointmentDetails {
  doctor_name?: string;
  date?: string;
  time_slot?: string;
}

interface PaymentSummaryProps {
  payments: Payment[];
  appointmentDetails: Record<string, AppointmentDetails>;
  className?: string;
  limit?: number;
}

export default function PaymentSummary({ 
  payments, 
  appointmentDetails, 
  className = '',
  limit = 3 
}: PaymentSummaryProps) {
  // Filter and sort payments by date (newest first)
  const sortedPayments = [...payments]
    .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
    .slice(0, limit);

  if (payments.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Recent Payments</h2>
          <Link href="/payments" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
            View All
          </Link>
        </div>
        <div className="p-4 text-center">
          <MdPayment className="mx-auto text-gray-400 text-4xl mb-2" />
          <p className="text-gray-500">No payment history yet</p>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'successful':
        return <FaCheckCircle className="text-green-500" />;
      case 'pending':
        return <MdAccessTime className="text-yellow-500" />;
      case 'failed':
        return <FaExclamationTriangle className="text-red-500" />;
      default:
        return <FaCreditCard className="text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Recent Payments</h2>
        <Link href="/payments" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
          View All
        </Link>
      </div>
      <div className="space-y-4">
        {sortedPayments.map((payment) => {
          const appointment = appointmentDetails[payment.appointment_id] || {};
          return (
            <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-gray-100">
                  {getStatusIcon(payment.status)}
                </div>
                <div>
                  <p className="font-medium text-gray-800">
                    {appointment.doctor_name || 'Medical Appointment'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {appointment.date ? `${formatDate(appointment.date)} - ${appointment.time_slot}` : 
                      formatDate(payment.payment_date)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">${payment.amount.toFixed(2)}</p>
                <p className={`text-xs capitalize ${
                  payment.status === 'successful' ? 'text-green-600' : 
                  payment.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {payment.status}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 