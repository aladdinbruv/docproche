export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type User = {
  id: string;
  email: string;
  full_name: string;
  role: 'patient' | 'doctor' | 'admin';
  phone_number?: string;
  profile_image?: string;
  specialty?: string;
  years_of_experience?: number;
  education?: string;
  bio?: string;
  consultation_fee?: number;
  available_days?: string[];
  created_at: string;
  updated_at?: string;
};

export type Appointment = {
  id: string;
  patient_id: string;
  doctor_id: string;
  date: string;
  time_slot: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  consultation_type: 'in-person' | 'video';
  symptoms?: string;
  notes?: string;
  payment_status: 'unpaid' | 'paid';
  payment_id?: string;
  created_at: string;
  updated_at?: string;
};

export type Review = {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at?: string;
};

export type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  appointment_id?: string;
  content: string;
  read: boolean;
  created_at: string;
  updated_at?: string;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'appointment' | 'message' | 'system';
  read: boolean;
  related_id?: string;
  created_at: string;
  updated_at?: string;
};

export type PaymentDetails = {
  id: string;
  appointment_id: string;
  patient_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_status: 'pending' | 'successful' | 'failed';
  transaction_id?: string;
  receipt_url?: string;
  created_at: string;
  updated_at?: string;
};

export type TimeSlot = {
  id: string;
  doctor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
  updated_at?: string;
};

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'created_at' | 'updated_at'> & { created_at?: string };
        Update: Partial<Omit<User, 'id'>>;
      };
      appointments: {
        Row: Appointment;
        Insert: Omit<Appointment, 'created_at' | 'updated_at'> & { created_at?: string };
        Update: Partial<Omit<Appointment, 'id'>>;
      };
      reviews: {
        Row: Review;
        Insert: Omit<Review, 'created_at' | 'updated_at'> & { created_at?: string };
        Update: Partial<Omit<Review, 'id'>>;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, 'created_at' | 'updated_at'> & { created_at?: string };
        Update: Partial<Omit<Message, 'id'>>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'created_at' | 'updated_at'> & { created_at?: string };
        Update: Partial<Omit<Notification, 'id'>>;
      };
      payment_details: {
        Row: PaymentDetails;
        Insert: Omit<PaymentDetails, 'created_at' | 'updated_at'> & { created_at?: string };
        Update: Partial<Omit<PaymentDetails, 'id'>>;
      };
      time_slots: {
        Row: TimeSlot;
        Insert: Omit<TimeSlot, 'created_at' | 'updated_at'> & { created_at?: string };
        Update: Partial<Omit<TimeSlot, 'id'>>;
      };
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_doctor_appointments: {
        Args: { doctor_id: string }
        Returns: {
          date: string
          doctor_id: string
          id: string
          mode: string
          patient_id: string
          payment_status: string
          status: string
          time: string
        }[]
      }
      get_patient_appointments: {
        Args: { patient_id: string }
        Returns: {
          date: string
          doctor_id: string
          id: string
          mode: string
          patient_id: string
          payment_status: string
          status: string
          time: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  T extends keyof Database['public']['Tables']
> = Database['public']['Tables'][T]['Row']

export type TablesInsert<
  T extends keyof Database['public']['Tables']
> = Database['public']['Tables'][T]['Insert']

export type TablesUpdate<
  T extends keyof Database['public']['Tables']
> = Database['public']['Tables'][T]['Update']

// Shortcuts for commonly used types
export type DoctorProfile = Tables<'doctor_profiles'>
export type Payment = Tables<'payments'>
export type Prescription = Tables<'prescriptions'> 