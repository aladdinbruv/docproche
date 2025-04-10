import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: 'doctor' | 'patient';
          full_name: string;
          phone_number: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          role: 'doctor' | 'patient';
          full_name: string;
          phone_number?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: 'doctor' | 'patient';
          full_name?: string;
          phone_number?: string;
          created_at?: string;
        };
      };
      doctor_profiles: {
        Row: {
          user_id: string;
          specialty: string;
          years_experience: number;
          location: string;
          bio: string;
          profile_picture: string;
          rating: number;
        };
        Insert: {
          user_id: string;
          specialty: string;
          years_experience: number;
          location: string;
          bio?: string;
          profile_picture?: string;
          rating?: number;
        };
        Update: {
          user_id?: string;
          specialty?: string;
          years_experience?: number;
          location?: string;
          bio?: string;
          profile_picture?: string;
          rating?: number;
        };
      };
      appointments: {
        Row: {
          id: string;
          doctor_id: string;
          patient_id: string;
          date: string;
          time: string;
          mode: 'in-person' | 'video';
          status: 'pending' | 'approved' | 'cancelled' | 'completed';
          payment_status: 'pending' | 'paid';
        };
        Insert: {
          id?: string;
          doctor_id: string;
          patient_id: string;
          date: string;
          time: string;
          mode: 'in-person' | 'video';
          status?: 'pending' | 'approved' | 'cancelled' | 'completed';
          payment_status?: 'pending' | 'paid';
        };
        Update: {
          id?: string;
          doctor_id?: string;
          patient_id?: string;
          date?: string;
          time?: string;
          mode?: 'in-person' | 'video';
          status?: 'pending' | 'approved' | 'cancelled' | 'completed';
          payment_status?: 'pending' | 'paid';
        };
      };
      prescriptions: {
        Row: {
          id: string;
          appointment_id: string;
          doctor_id: string;
          patient_id: string;
          file_url: string;
          notes: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          appointment_id: string;
          doctor_id: string;
          patient_id: string;
          file_url: string;
          notes?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          appointment_id?: string;
          doctor_id?: string;
          patient_id?: string;
          file_url?: string;
          notes?: string;
          created_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          from_user_id: string;
          to_user_id: string;
          text: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          from_user_id: string;
          to_user_id: string;
          text: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          from_user_id?: string;
          to_user_id?: string;
          text?: string;
          created_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          appointment_id: string;
          amount: number;
          transaction_id: string;
          status: 'successful' | 'failed';
          payment_date: string;
        };
        Insert: {
          id?: string;
          appointment_id: string;
          amount: number;
          transaction_id: string;
          status: 'successful' | 'failed';
          payment_date?: string;
        };
        Update: {
          id?: string;
          appointment_id?: string;
          amount?: number;
          transaction_id?: string;
          status?: 'successful' | 'failed';
          payment_date?: string;
        };
      };
    };
  };
}; 