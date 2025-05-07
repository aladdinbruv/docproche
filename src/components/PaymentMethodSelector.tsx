import React, { useState } from 'react';
import { FaCreditCard, FaPaypal, FaApplePay, FaRegMoneyBillAlt } from 'react-icons/fa';
import { SiGooglepay } from 'react-icons/si';

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

interface PaymentMethodSelectorProps {
  onSelect: (methodId: string) => void;
  selectedMethod: string;
  className?: string;
}

export default function PaymentMethodSelector({ 
  onSelect, 
  selectedMethod, 
  className = '' 
}: PaymentMethodSelectorProps) {
  // Define available payment methods
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      name: 'Credit Card',
      icon: <FaCreditCard className="text-blue-600" />,
      description: 'Pay securely with your credit or debit card'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: <FaPaypal className="text-blue-800" />,
      description: 'Pay with your PayPal account'
    },
    {
      id: 'apple-pay',
      name: 'Apple Pay',
      icon: <FaApplePay className="text-gray-900" />,
      description: 'Quick checkout with Apple Pay'
    },
    {
      id: 'google-pay',
      name: 'Google Pay',
      icon: <SiGooglepay className="text-gray-800" />,
      description: 'Fast checkout with Google Pay'
    },
    {
      id: 'insurance',
      name: 'Insurance',
      icon: <FaRegMoneyBillAlt className="text-green-600" />,
      description: 'Bill to your insurance provider'
    }
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-medium text-gray-900">Select Payment Method</h3>
      
      <div className="space-y-2">
        {paymentMethods.map((method) => (
          <div 
            key={method.id}
            onClick={() => onSelect(method.id)}
            className={`
              flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors
              ${selectedMethod === method.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
              }
            `}
          >
            <div className="flex-shrink-0 text-2xl">
              {method.icon}
            </div>
            
            <div className="flex-grow">
              <h4 className="font-medium">{method.name}</h4>
              <p className="text-sm text-gray-500">{method.description}</p>
            </div>
            
            <div className="flex-shrink-0">
              <div className={`
                w-5 h-5 rounded-full border-2
                ${selectedMethod === method.id 
                  ? 'border-blue-500 bg-blue-500' 
                  : 'border-gray-300'
                }
              `}>
                {selectedMethod === method.id && (
                  <span className="flex items-center justify-center h-full">
                    <span className="block w-2 h-2 rounded-full bg-white"></span>
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="pt-2">
        <p className="text-xs text-gray-500">
          All payments are processed securely. Your payment information is never stored on our servers.
        </p>
      </div>
    </div>
  );
} 