'use client';

import React, { useEffect, useState } from 'react';
import { createClientComponentClient } from '@/lib/supabase';
import { Info, AlertCircle, CheckCircle2 } from 'lucide-react';

interface CheckResult {
  exists: boolean;
  name: string;
  description: string;
}

export function SupabaseChecker() {
  const [isChecking, setIsChecking] = useState(true);
  const [checkResults, setCheckResults] = useState<CheckResult[]>([]);
  const [showAll, setShowAll] = useState(false);
  
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkFunctions = async () => {
      setIsChecking(true);
      
      try {
        // Check for required functions
        const requiredFunctions = [
          {
            name: 'get_doctor_analytics',
            description: 'Get doctor dashboard analytics data',
            testParams: { doctor_id: '00000000-0000-0000-0000-000000000000' }
          },
          {
            name: 'get_doctor_patients',
            description: 'Get doctor\'s patients with appointment information',
            testParams: { doctor_id: '00000000-0000-0000-0000-000000000000' }
          },
          {
            name: 'get_payment_summary',
            description: 'Get payment summary for a user',
            testParams: { user_id: '00000000-0000-0000-0000-000000000000', user_role: 'doctor' }
          },
          {
            name: 'get_appointment_by_id',
            description: 'Get appointment details bypassing RLS',
            testParams: { appointment_id: '00000000-0000-0000-0000-000000000000' }
          },
          {
            name: 'get_filtered_doctors',
            description: 'Get filtered list of doctors bypassing RLS',
            testParams: { specialty_filter: null, location_filter: null, limit_val: 1, offset_val: 0 }
          }
        ];
        
        const results = await Promise.all(
          requiredFunctions.map(async (fn) => {
            try {
              // Call with appropriate parameters to check if function exists
              const { error } = await supabase.rpc(fn.name, fn.testParams);
              
              // Check if we got no error (function exists and worked) OR
              // if we got an error but it's NOT about the function not existing
              // (e.g., parameter errors, validation errors, etc.)
              const functionExists = !error || (
                error && 
                !error.message.includes('function') && 
                !error.message.includes('does not exist') &&
                !error.message.includes('does not exist in schema')
              );
              
              return {
                exists: functionExists,
                name: fn.name,
                description: fn.description
              };
            } catch (err: any) {
              // For caught exceptions, check the error message
              const isNotFoundError = err.message && (
                err.message.includes('function') || 
                err.message.includes('does not exist') ||
                err.message.includes('does not exist in schema')
              );
              
              return {
                exists: !isNotFoundError,
                name: fn.name,
                description: fn.description
              };
            }
          })
        );
        
        setCheckResults(results);
      } catch (error) {
        console.error('Error checking Supabase functions:', error);
      } finally {
        setIsChecking(false);
      }
    };
    
    checkFunctions();
  }, []);
  
  const missingFunctions = checkResults.filter(r => !r.exists);
  const allFunctionsExist = missingFunctions.length === 0;
  
  if (isChecking) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3 text-sm mb-4">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        <span>Checking database functions...</span>
      </div>
    );
  }
  
  if (allFunctionsExist && !showAll) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-sm mb-4">
        <CheckCircle2 className="h-5 w-5 text-green-500" />
        <span>All required database functions are installed.</span>
        <button 
          onClick={() => setShowAll(true)} 
          className="text-green-700 font-medium hover:underline ml-auto"
        >
          Show details
        </button>
      </div>
    );
  }
  
  return (
    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-4">
      <div className="flex items-center gap-3 mb-2">
        {!allFunctionsExist ? (
          <AlertCircle className="h-5 w-5 text-amber-500" />
        ) : (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        )}
        <span className="font-medium">
          {!allFunctionsExist 
            ? `${missingFunctions.length} database functions missing` 
            : 'All required database functions are installed'}
        </span>
        {showAll && (
          <button 
            onClick={() => setShowAll(false)} 
            className="text-amber-700 hover:underline ml-auto text-sm"
          >
            Hide details
          </button>
        )}
        {!showAll && (
          <button 
            onClick={() => setShowAll(true)} 
            className="text-amber-700 hover:underline ml-auto text-sm"
          >
            Show details
          </button>
        )}
      </div>
      
      {showAll && (
        <>
          <p className="text-sm mb-3">
            {!allFunctionsExist 
              ? 'The following database functions are missing but DocProche will use fallback implementations:' 
              : 'All database functions are properly installed:'}
          </p>
          <ul className="space-y-2 text-sm">
            {checkResults.map((result) => (
              <li key={result.name} className="flex items-start gap-2">
                {result.exists ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                ) : (
                  <Info className="h-4 w-4 text-amber-500 mt-0.5" />
                )}
                <div>
                  <span className="font-medium">{result.name}</span>
                  <p className="text-sm text-gray-600">{result.description}</p>
                </div>
              </li>
            ))}
          </ul>
          
          {!allFunctionsExist && (
            <div className="mt-4 text-sm bg-white p-3 rounded border border-amber-100">
              <p className="font-medium mb-1">To install these functions:</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-700">
                <li>Find the SQL migration at <code className="bg-gray-100 px-1 py-0.5 rounded">supabase/migrations/20240512_doctor_analytics.sql</code></li>
                <li>Apply the migration using the Supabase CLI: <code className="bg-gray-100 px-1 py-0.5 rounded">npx supabase migration up</code></li>
                <li>Alternatively, you can run the SQL directly in the Supabase dashboard SQL editor</li>
              </ol>
              <p className="mt-2 text-amber-700">Note: The application will still work without these functions using fallback logic.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
} 