// src/hooks/useDoctors.ts
import { useState, useEffect } from 'react';
import { User } from '@/types/supabase';

interface UseDoctorsOptions {
  specialty?: string;
  location?: string;
  limit?: number;
  page?: number;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useDoctors(options: UseDoctorsOptions = {}) {
  const [doctors, setDoctors] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: options.page || 1,
    limit: options.limit || 10,
    totalPages: 0
  });

  const fetchDoctors = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const {
        specialty,
        location,
        limit = 10,
        page = 1
      } = options;

      // Build the query params for the API route
      const params = new URLSearchParams();
      
      // Only add non-null/undefined values
      if (specialty) params.append('specialty', specialty);
      if (location) params.append('location', location);
      params.append('limit', limit.toString());
      params.append('page', page.toString());

      // Fetch from the API route
      const response = await fetch(`/api/doctors?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch doctors');
      }

      const data = await response.json();
      
      setDoctors(data.doctors || []);
      setPagination(data.pagination);
    } catch (err: Error | unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching doctors:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Only trigger fetch when these specific properties change
  useEffect(() => {
    fetchDoctors();
  }, [
    options.specialty, 
    options.location, 
    options.page, 
    options.limit
  ]);

  return {
    doctors,
    isLoading,
    error,
    pagination,
    refetch: fetchDoctors
  };
}