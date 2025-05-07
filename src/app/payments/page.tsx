"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { FaCheckCircle, FaExclamationTriangle, FaLongArrowAltLeft } from "react-icons/fa";
import { MdPayment, MdAccessTime } from "react-icons/md";
import Link from "next/link";
import { usePayments } from "@/hooks/usePayments";
import PaymentDetails from "@/components/PaymentDetails";
import { useAuth } from "@/hooks/useAuth";

export default function PaymentsPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const canceled = searchParams.get("canceled");
  
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const { payments, appointmentDetails, isLoading, error, retryPayment } = usePayments();
  
  // Check for payment session
  useEffect(() => {
    if (sessionId && payments.length > 0) {
      // Find payment with this transaction ID
      const payment = payments.find(p => p.transaction_id === sessionId);
      if (payment) {
        setSelectedPaymentId(payment.id);
      }
    }
  }, [sessionId, payments]);
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Please log in</h2>
            <p className="text-gray-600 mb-4">You need to be logged in to view your payment history.</p>
            <Link 
              href="/auth/login?redirectTo=/payments"
              className="inline-block px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
            >
              Log In
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <motion.div 
          className="h-16 w-16 border-t-4 border-blue-500 border-solid rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }
  
  const selectedPayment = selectedPaymentId 
    ? payments.find(p => p.id === selectedPaymentId) 
    : null;
    
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };

  // Handle the canceled payment scenario
  if (canceled) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6 bg-yellow-500 flex items-center">
                <FaExclamationTriangle className="h-8 w-8 text-white" />
                <div className="ml-4">
                  <h2 className="text-xl font-bold text-white">Payment Canceled</h2>
                  <p className="text-white opacity-90">
                    You've canceled your payment process.
                  </p>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-700 mb-4">
                  Your payment was not completed. If you still want to book the appointment, 
                  you can return to the appointments page and try again.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    href="/dashboard"
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Go to Dashboard
                  </Link>
                  <Link 
                    href="/appointments"
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    View Appointments
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If we have a selected payment (from a successful payment or clicking on a payment)
  if (selectedPayment) {
    const appointment = appointmentDetails[selectedPayment.appointment_id] || {};
    return (
      <div className="min-h-screen bg-gray-50 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <button
              onClick={() => setSelectedPaymentId(null)}
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-6"
            >
              <FaLongArrowAltLeft className="mr-2" />
              Back to Payment History
            </button>
            
            <PaymentDetails
              payment={selectedPayment}
              appointment={{
                id: selectedPayment.appointment_id,
                doctor_name: appointment.doctor_name || 'Doctor',
                date: appointment.date || new Date().toISOString(),
                time_slot: appointment.time_slot || '9:00 AM',
                consultation_type: (appointment.consultation_type as any) || 'in-person'
              }}
              onRetryPayment={
                selectedPayment.status !== 'successful' 
                  ? () => retryPayment(selectedPayment.appointment_id)
                  : undefined
              }
            />
          </div>
        </div>
      </div>
    );
  }
  
  // Default view - payment history list
  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
            <Link 
              href="/dashboard"
              className="text-sm font-medium text-primary-600 hover:text-primary-800"
            >
              Back to Dashboard
            </Link>
          </div>
          
          {payments.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <MdPayment className="mx-auto text-gray-400 text-5xl mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">No payments yet</h2>
              <p className="text-gray-600 mb-4">You haven't made any payments for appointments.</p>
              <Link 
                href="/doctors"
                className="inline-block px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
              >
                Book an Appointment
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments
                      .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
                      .map((payment) => {
                        const appointment = appointmentDetails[payment.appointment_id] || {};
                        return (
                          <tr 
                            key={payment.id}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => setSelectedPaymentId(payment.id)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(payment.payment_date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {appointment.doctor_name || 'Medical Appointment'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {appointment.date && formatDate(appointment.date)} - {appointment.time_slot}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              ${payment.amount.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${payment.status === 'successful' ? 'bg-green-100 text-green-800' : 
                                  payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-red-100 text-red-800'}`}
                              >
                                {payment.status === 'successful' ? (
                                  <span className="flex items-center">
                                    <FaCheckCircle className="mr-1" /> Paid
                                  </span>
                                ) : payment.status === 'pending' ? (
                                  <span className="flex items-center">
                                    <MdAccessTime className="mr-1" /> Pending
                                  </span>
                                ) : (
                                  <span className="flex items-center">
                                    <FaExclamationTriangle className="mr-1" /> Failed
                                  </span>
                                )}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPaymentId(payment.id);
                                }}
                                className="text-primary-600 hover:text-primary-900"
                              >
                                View
                              </button>
                              {payment.status !== 'successful' && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    retryPayment(payment.appointment_id);
                                  }}
                                  className="ml-4 text-blue-600 hover:text-blue-900"
                                >
                                  {payment.status === 'failed' ? 'Retry' : 'Complete'}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <FaExclamationTriangle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error loading payments</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 