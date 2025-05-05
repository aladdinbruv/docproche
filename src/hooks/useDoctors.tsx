// src/hooks/useDoctors.ts
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@/lib/supabase';
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

  const supabase = createClientComponentClient();

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

      const offset = (page - 1) * limit;

      // Start building the query
      let query = supabase
        .from('users')
        .select('*')
        .eq('role', 'doctor')
        .order('created_at', { ascending: false });

      // Apply filters if they exist
      if (specialty) {
        query = query.eq('specialty', specialty);
      }

      if (location) {
        query = query.ilike('location', `%${location}%`);
      }

      // Execute the query with pagination
      const { data, error: fetchError } = await query
        .range(offset, offset + limit - 1)
        .limit(limit);

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      // Get total count for pagination
      const { count, error: countError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'doctor');

      if (countError) {
        console.error('Error getting doctor count:', countError);
      }

      setDoctors(data || []);
      setPagination({
        total: count || 0,
        page,
        limit,
        totalPages: count ? Math.ceil(count / limit) : 0
      });
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching doctors:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [options.specialty, options.location, options.page, options.limit]);

  return {
    doctors,
    isLoading,
    error,
    pagination,
    refetch: fetchDoctors
  };
}