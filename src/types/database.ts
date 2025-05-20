export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      health_records: {
        Row: {
          id: string
          patient_id: string
          doctor_id: string
          appointment_id?: string | null
          record_type: string
          title: string
          description?: string | null
          file_url?: string | null
          is_confidential?: boolean | null
          created_at: string
          updated_at?: string | null
          last_accessed_at?: string | null
          last_accessed_by?: string | null
        }
        Insert: {
          id?: string
          patient_id: string
          doctor_id: string
          appointment_id?: string | null
          record_type: string
          title: string
          description?: string | null
          file_url?: string | null
          is_confidential?: boolean | null
          created_at?: string
          updated_at?: string | null
          last_accessed_at?: string | null
          last_accessed_by?: string | null
        }
        Update: {
          id?: string
          patient_id?: string
          doctor_id?: string
          appointment_id?: string | null
          record_type?: string
          title?: string
          description?: string | null
          file_url?: string | null
          is_confidential?: boolean | null
          created_at?: string
          updated_at?: string | null
          last_accessed_at?: string | null
          last_accessed_by?: string | null
        }
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: string
          phone_number?: string | null
          profile_image?: string | null
          specialty?: string | null
          years_of_experience?: number | null
          education?: string | null
          bio?: string | null
          consultation_fee?: number | null
          available_days?: string[] | null
          created_at?: string
          updated_at?: string | null
          location?: string | null
          medical_license?: string | null
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role: string
          phone_number?: string | null
          profile_image?: string | null
          specialty?: string | null
          years_of_experience?: number | null
          education?: string | null
          bio?: string | null
          consultation_fee?: number | null
          available_days?: string[] | null
          created_at?: string
          updated_at?: string | null
          location?: string | null
          medical_license?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: string
          phone_number?: string | null
          profile_image?: string | null
          specialty?: string | null
          years_of_experience?: number | null
          education?: string | null
          bio?: string | null
          consultation_fee?: number | null
          available_days?: string[] | null
          created_at?: string
          updated_at?: string | null
          location?: string | null
          medical_license?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_doctor_health_records: {
        Args: {
          doctor_id_param: string
        }
        Returns: Database['public']['Tables']['health_records']['Row'][]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
} 