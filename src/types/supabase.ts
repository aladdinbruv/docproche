export type HealthRecord = {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_id?: string;
  record_type: string;
  title: string;
  description?: string;
  file_url?: string;
  is_confidential?: boolean;
  created_at: string;
  updated_at?: string;
  last_accessed_at?: string;
  last_accessed_by?: string;
};

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
  location?: string;
  email_verified?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type MedicalHistory = {
  id: string;
  patient_id: string;
  history_type: string;
  description: string;
  diagnosed_date?: string;
  is_current: boolean;
  created_at: string;
  updated_at?: string;
};

export type Prescription = {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_id?: string;
  medications: Json;
  instructions?: string;
  issue_date: string;
  expiry_date?: string;
  is_active: boolean;
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
  created_by?: string;
  last_modified_by?: string;
};

export interface Database {
  public: {
    Tables: {
      health_records: {
        Row: HealthRecord;
        Insert: Omit<HealthRecord, 'created_at' | 'updated_at'> & { created_at?: string };
        Update: Partial<Omit<HealthRecord, 'id'>>;
      };
      medical_history: {
        Row: MedicalHistory;
        Insert: Omit<MedicalHistory, 'created_at' | 'updated_at'> & { created_at?: string };
        Update: Partial<Omit<MedicalHistory, 'id'>>;
      };
      appointments: {
        Row: Appointment;
        Insert: Omit<Appointment, 'created_at' | 'updated_at'> & { created_at?: string };
        Update: Partial<Omit<Appointment, 'id'>>;
      };
    }
    Functions: {
      get_health_record: {
        Args: { record_id: string }
        Returns: HealthRecord[]
      }
      get_patient_health_records: {
        Args: { patient_id: string }
        Returns: HealthRecord[]
      }
      get_patient_appointments: {
        Args: { patient_id: string }
        Returns: Appointment[]
      }
      get_doctor_appointments: {
        Args: { doctor_id: string }
        Returns: Appointment[]
      }
    }
  }
}

export type HealthRecord = Tables<'health_records'>
export type MedicalHistory = Tables<'medical_history'>
export type Appointment = Tables<'appointments'>
