import React from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaClock, FaCreditCard, FaCalendarAlt, FaUserMd, FaMapMarkerAlt, FaVideo } from 'react-icons/fa';
import { MdAccessTime } from 'react-icons/md';

interface PaymentDetailsProps {
  payment: {
    id: string;
    amount: number;
    transaction_id: string;
    status: 'pending' | 'successful' | 'failed';
    payment_date: string;
  };
  appointment: {
    id: string;
    doctor_name: string;
    date: string;
    time_slot: string;
    consultation_type: 'in-person' | 'video';
  };
  onRetryPayment?: () => void;
  className?: string;
}

export default function PaymentDetails({
  payment,
  appointment,
  onRetryPayment,
  className = '',
}: PaymentDetailsProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const formatPaymentDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
      {/* Payment Status Header */}
      <div 
        className={`
          p-6 flex items-center justify-between
          ${payment.status === 'successful' ? 'bg-green-500' : 
            payment.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'}
        `}
      >
        <div className="flex items-center">
          {payment.status === 'successful' ? (
            <FaCheckCircle className="h-8 w-8 text-white" />
          ) : payment.status === 'pending' ? (
            <FaClock className="h-8 w-8 text-white" />
          ) : (
            <FaExclamationTriangle className="h-8 w-8 text-white" />
          )}
          <div className="ml-4">
            <h2 className="text-xl font-bold text-white">
              Payment {payment.status === 'successful' ? 'Successful' : 
                payment.status === 'pending' ? 'Pending' : 'Failed'}
            </h2>
            <p className="text-white opacity-90">
              {payment.status === 'successful' ? 'Your payment has been processed successfully.' :
               payment.status === 'pending' ? 'Your payment is being processed.' :
               'There was an issue with your payment.'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">${payment.amount.toFixed(2)}</p>
        </div>
      </div>

      {/* Payment Details */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Payment Date</p>
            <p className="flex items-center text-gray-800">
              <MdAccessTime className="mr-2 text-gray-500" />
              {formatPaymentDate(payment.payment_date)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Payment Method</p>
            <p className="flex items-center text-gray-800">
              <FaCreditCard className="mr-2 text-gray-500" />
              Credit Card
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Transaction ID</p>
            <p className="text-gray-800 font-mono text-sm">
              {payment.transaction_id}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Status</p>
            <p className={`
              inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
              ${payment.status === 'successful' ? 'bg-green-100 text-green-800' : 
                payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                'bg-red-100 text-red-800'}
            `}>
              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
            </p>
          </div>
        </div>
      </div>

      {/* Appointment Details */}
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Appointment Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Doctor</p>
            <p className="flex items-center text-gray-800">
              <FaUserMd className="mr-2 text-gray-500" />
              {appointment.doctor_name}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Appointment Date</p>
            <p className="flex items-center text-gray-800">
              <FaCalendarAlt className="mr-2 text-gray-500" />
              {formatDate(appointment.date)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Time Slot</p>
            <p className="flex items-center text-gray-800">
              <MdAccessTime className="mr-2 text-gray-500" />
              {appointment.time_slot}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Consultation Type</p>
            <p className="flex items-center text-gray-800">
              {appointment.consultation_type === 'video' ? (
                <><FaVideo className="mr-2 text-gray-500" /> Video Consultation</>
              ) : (
                <><FaMapMarkerAlt className="mr-2 text-gray-500" /> In-Person Visit</>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons for failed or pending payments */}
      {payment.status !== 'successful' && onRetryPayment && (
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onRetryPayment}
            className="w-full md:w-auto px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg shadow-sm transition"
          >
            {payment.status === 'failed' ? 'Retry Payment' : 'Complete Payment'}
          </button>
          <p className="mt-2 text-sm text-gray-500">
            {payment.status === 'failed' 
              ? 'Your payment was not successful. Please try again.'
              : 'Complete your pending payment to confirm your appointment.'}
          </p>
        </div>
      )}
    </div>
  );
} 