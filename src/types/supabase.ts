// Supabase entity interfaces for use throughout the application

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Base interfaces - directly used from the database
export interface UserBase {
  id: string;
  email: string;
  full_name: string;
  role: string;
  phone_number?: string | null;
  profile_image?: string | null;
  specialty?: string | null;
  years_of_experience?: number | null;
  education?: string | null;
  bio?: string | null;
  consultation_fee?: number | null;
  available_days?: string[] | null;
  created_at?: string;
  updated_at?: string | null;
  location?: string | null;
  medical_license?: string | null;
}

export interface HealthRecordBase {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_id?: string | null;
  record_type: string;
  title: string;
  description?: string | null;
  file_url?: string | null;
  is_confidential?: boolean | null;
  created_at: string;
  updated_at?: string | null;
  last_accessed_at?: string | null;
  last_accessed_by?: string | null;
}

export interface AppointmentBase {
  id: string;
  patient_id: string;
  doctor_id: string;
  date: string;
  time_slot: string;
  status: string; // 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
  consultation_type: string; // 'video' | 'in-person'
  symptoms?: string | null;
  notes?: string | null;
  created_at: string | null;
  updated_at?: string | null;
  payment_status?: string;
}

export interface MedicalHistoryBase {
  id: string;
  patient_id: string;
  history_type: string;
  description: string;
  is_current: boolean | null;
  diagnosed_date?: string | null;
  created_at: string | null;
  updated_at?: string | null;
}

export interface PrescriptionBase {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_id?: string | null;
  medications: Json;
  instructions?: string | null;
  issue_date: string;
  expiry_date?: string | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at?: string | null;
}

export interface TimeSlotBase {
  id: string;
  doctor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface PaymentBase {
  id: string;
  appointment_id: string;
  amount: number;
  transaction_id: string;
  status: string; // 'pending' | 'successful' | 'failed'
  payment_date?: string | null;
}

export interface MessageBase {
  id: string;
  sender_id: string;
  receiver_id: string;
  appointment_id?: string | null;
  content: string;
  read: boolean | null;
  contains_phi: boolean | null;
  created_at: string | null;
  updated_at?: string | null;
}

// Extended interfaces - with additional relationships and typed fields
export type User = UserBase;

export interface Appointment extends AppointmentBase {
  patient?: User;
  doctor?: User;
}

export interface HealthRecord extends HealthRecordBase {
  patient?: {
    id: string;
    full_name: string;
    email?: string;
  };
  appointment?: {
    date: string;
    time_slot: string;
    consultation_type: string;
  };
}

export type MedicalHistory = MedicalHistoryBase;

// Base interfaces for PrescriptionBase medications
export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
}

export type MedicationRecord = Record<string, Medication>;

export interface Prescription extends Omit<PrescriptionBase, 'medications'> {
  // Override medications with a properly typed version
  medications: Medication[] | MedicationRecord;
  patient?: {
    id: string;
    full_name: string;
    email?: string;
  };
  doctor?: {
    id: string;
    full_name: string;
    specialty?: string;
  };
  appointment?: {
    date: string;
    time_slot: string;
    consultation_type: string;
  };
}

export type TimeSlot = TimeSlotBase;

export interface Payment extends PaymentBase {
  patient?: {
    id: string;
    full_name: string;
    email?: string;
  };
  appointment?: {
    date: string;
    time_slot: string;
    consultation_type: string;
  };
}

export interface Message extends MessageBase {
  sender?: {
    id: string;
    full_name: string;
    profile_image?: string;
    role: string;
  };
  receiver?: {
    id: string;
    full_name: string;
    profile_image?: string;
    role: string;
  };
}

// Additional interfaces
export interface DoctorProfile {
  user_id: string;
  specialty: string;
  years_experience: number;
  location: string;
  bio?: string | null;
  profile_picture?: string | null;
  rating?: number | null;
}

export interface Review {
  id: string;
  doctor_id: string;
  patient_id: string;
  appointment_id: string;
  rating: number;
  comment?: string | null;
  is_verified?: boolean | null;
  created_at: string | null;
  updated_at?: string | null;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  related_id?: string | null;
  read?: boolean | null;
  created_at: string | null;
  updated_at?: string | null;
}
