// src/hooks/useDoctor.ts
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@/lib/supabase';
import { User } from '@/types/supabase';

export function useDoctor(doctorId: string) {
  const [doctor, setDoctor] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchDoctor() {
      try {
        setIsLoading(true);
        setError(null);

        if (!doctorId) {
          throw new Error('Doctor ID is required');
        }

        const { data, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('id', doctorId)
          .eq('role', 'doctor')
          .single();

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        setDoctor(data);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching doctor:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDoctor();
  }, [doctorId]);

  return { doctor, isLoading, error };
}