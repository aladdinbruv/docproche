import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@/lib/supabase';

export interface TimeSlot {
  id: string;
  doctor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at?: string;
  updated_at?: string;
}

export function useTimeSlots(doctorId: string) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClientComponentClient();

  const fetchTimeSlots = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/time-slots?doctorId=${doctorId}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch time slots');
      }
      
      const { time_slots } = await response.json();
      setTimeSlots(time_slots || []);
    } catch (err: any) {
      console.error('Error fetching time slots:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (doctorId) {
      fetchTimeSlots();
    }
  }, [doctorId]);

  const createTimeSlot = async (newTimeSlot: Omit<TimeSlot, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/time-slots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTimeSlot),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create time slot');
      }

      const { time_slot } = await response.json();
      setTimeSlots(prev => [...prev, time_slot]);
      return time_slot;
    } catch (err: any) {
      console.error('Error creating time slot:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTimeSlot = async (id: string, updates: Partial<Omit<TimeSlot, 'id' | 'doctor_id' | 'created_at' | 'updated_at'>>) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/time-slots', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...updates }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update time slot');
      }

      const { time_slot } = await response.json();
      setTimeSlots(prev => prev.map(slot => slot.id === id ? time_slot : slot));
      return time_slot;
    } catch (err: any) {
      console.error('Error updating time slot:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTimeSlot = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/time-slots?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete time slot');
      }

      setTimeSlots(prev => prev.filter(slot => slot.id !== id));
      return true;
    } catch (err: any) {
      console.error('Error deleting time slot:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create bulk time slots for recurring availability
  const createRecurringTimeSlots = async (
    doctorId: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    isAvailable: boolean = true,
    weeks: number = 8
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const newTimeSlot = {
        doctor_id: doctorId,
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
        is_available: isAvailable
      };
      
      // Create time slot for multiple weeks (default 8 weeks)
      const createdTimeSlot = await createTimeSlot(newTimeSlot);
      
      return createdTimeSlot;
    } catch (err: any) {
      console.error('Error creating recurring time slots:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    timeSlots,
    loading,
    error,
    fetchTimeSlots,
    createTimeSlot,
    updateTimeSlot,
    deleteTimeSlot,
    createRecurringTimeSlots
  };
} 