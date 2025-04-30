-- Create required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- SECURITY: Enable Row Level Security (RLS) on all tables
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payment_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.medical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.prescriptions ENABLE ROW LEVEL SECURITY;

-- Drop and recreate tables with proper constraints and data types

-- USERS TABLE
DROP TABLE IF EXISTS public.users CASCADE;
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('patient', 'doctor', 'admin')),
  phone_number TEXT,
  profile_image TEXT,
  specialty TEXT,
  years_of_experience INTEGER,
  education TEXT,
  bio TEXT,
  consultation_fee DECIMAL(10,2),
  available_days TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  -- SECURITY: Add verification status for additional security
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE
);

-- APPOINTMENTS TABLE
DROP TABLE IF EXISTS public.appointments CASCADE;
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL, -- ISO date format, can be converted to DATE if needed
  time_slot TEXT NOT NULL, -- Can be converted to TIME if needed
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  consultation_type TEXT NOT NULL CHECK (consultation_type IN ('in-person', 'video')),
  symptoms TEXT,
  notes TEXT,
  payment_status TEXT NOT NULL CHECK (payment_status IN ('unpaid', 'paid')),
  payment_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  -- SECURITY: Metadata for audit trail
  created_by UUID REFERENCES public.users(id),
  last_modified_by UUID REFERENCES public.users(id)
);

-- REVIEWS TABLE
DROP TABLE IF EXISTS public.reviews CASCADE;
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  -- SECURITY: Prevent manipulation of reviews
  is_verified BOOLEAN DEFAULT FALSE
);

-- MESSAGES TABLE
DROP TABLE IF EXISTS public.messages CASCADE;
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  -- SECURITY: Flag for sensitive content
  contains_phi BOOLEAN DEFAULT FALSE
);

-- NOTIFICATIONS TABLE
DROP TABLE IF EXISTS public.notifications CASCADE;
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('appointment', 'message', 'system')),
  read BOOLEAN DEFAULT FALSE,
  related_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- PAYMENT DETAILS TABLE
DROP TABLE IF EXISTS public.payment_details CASCADE;
CREATE TABLE public.payment_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'successful', 'failed')),
  transaction_id TEXT,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  -- SECURITY: For identifying suspicious transactions
  ip_address TEXT,
  device_info TEXT
);

-- TIME SLOTS TABLE
DROP TABLE IF EXISTS public.time_slots CASCADE;
CREATE TABLE public.time_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- HEALTH RECORDS TABLE (New table for patient health data)
DROP TABLE IF EXISTS public.health_records CASCADE;
CREATE TABLE public.health_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  record_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  is_confidential BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  -- SECURITY: For data access auditing
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  last_accessed_by UUID REFERENCES public.users(id)
);

-- MEDICAL HISTORY TABLE (New table for patient history)
DROP TABLE IF EXISTS public.medical_history CASCADE;
CREATE TABLE public.medical_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  history_type TEXT NOT NULL,
  description TEXT NOT NULL,
  diagnosed_date DATE,
  is_current BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- PRESCRIPTIONS TABLE
DROP TABLE IF EXISTS public.prescriptions CASCADE;
CREATE TABLE public.prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  medications JSONB NOT NULL,
  instructions TEXT,
  issue_date DATE NOT NULL,
  expiry_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Create audit trail trigger function
CREATE OR REPLACE FUNCTION update_timestamp_and_user()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  
  -- If the table has last_modified_by column, update it
  IF TG_TABLE_NAME = 'appointments' THEN
    NEW.last_modified_by = auth.uid();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply the trigger to relevant tables
CREATE TRIGGER update_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_timestamp_and_user();

CREATE TRIGGER update_appointments_timestamp_and_user
BEFORE UPDATE ON appointments
FOR EACH ROW EXECUTE FUNCTION update_timestamp_and_user();

CREATE TRIGGER update_reviews_timestamp
BEFORE UPDATE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_timestamp_and_user();

CREATE TRIGGER update_messages_timestamp
BEFORE UPDATE ON messages
FOR EACH ROW EXECUTE FUNCTION update_timestamp_and_user();

CREATE TRIGGER update_notifications_timestamp
BEFORE UPDATE ON notifications
FOR EACH ROW EXECUTE FUNCTION update_timestamp_and_user();

CREATE TRIGGER update_payment_details_timestamp
BEFORE UPDATE ON payment_details
FOR EACH ROW EXECUTE FUNCTION update_timestamp_and_user();

CREATE TRIGGER update_time_slots_timestamp
BEFORE UPDATE ON time_slots
FOR EACH ROW EXECUTE FUNCTION update_timestamp_and_user();

CREATE TRIGGER update_health_records_timestamp
BEFORE UPDATE ON health_records
FOR EACH ROW EXECUTE FUNCTION update_timestamp_and_user();

CREATE TRIGGER update_medical_history_timestamp
BEFORE UPDATE ON medical_history
FOR EACH ROW EXECUTE FUNCTION update_timestamp_and_user();

CREATE TRIGGER update_prescriptions_timestamp
BEFORE UPDATE ON prescriptions
FOR EACH ROW EXECUTE FUNCTION update_timestamp_and_user();

-- HEALTH RECORD ACCESS TRACKING
-- Create a function to track access to health records
CREATE OR REPLACE FUNCTION track_health_record_access(record_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE health_records
  SET last_accessed_at = NOW(), last_accessed_by = auth.uid()
  WHERE id = record_id;
  
  -- Optional: insert into an access log table
  -- INSERT INTO health_record_access_logs (record_id, accessed_by, accessed_at)
  -- VALUES (record_id, auth.uid(), NOW());
END;
$$;

-- Create a function that gets a health record and tracks access
CREATE OR REPLACE FUNCTION get_health_record(record_id UUID)
RETURNS SETOF health_records
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- First check if user has access
  IF NOT EXISTS (
    SELECT 1 FROM health_records hr
    WHERE hr.id = record_id
    AND (
      auth.uid() = hr.patient_id OR 
      auth.uid() = hr.doctor_id OR
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    )
  ) THEN
    RAISE EXCEPTION 'Access denied to health record';
  END IF;

  -- Track the access
  PERFORM track_health_record_access(record_id);
  
  -- Return the record
  RETURN QUERY SELECT * FROM health_records WHERE id = record_id;
END;
$$;

-- Function to get all health records for a patient with access tracking
CREATE OR REPLACE FUNCTION get_patient_health_records(patient_id UUID)
RETURNS SETOF health_records
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rec health_records;
BEGIN
  -- Check if user has permission to access these records
  IF NOT (
    auth.uid() = patient_id OR
    EXISTS (
      SELECT 1 FROM appointments 
      WHERE doctor_id = auth.uid() AND patient_id = get_patient_health_records.patient_id
    ) OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  ) THEN
    RAISE EXCEPTION 'Access denied to patient health records';
  END IF;

  -- Iterate through records and track access for each
  FOR rec IN 
    SELECT * FROM health_records 
    WHERE health_records.patient_id = get_patient_health_records.patient_id
    ORDER BY created_at DESC
  LOOP
    PERFORM track_health_record_access(rec.id);
    RETURN NEXT rec;
  END LOOP;
  
  RETURN;
END;
$$;

-- SECURITY POLICIES
-- These policies ensure data access is strictly controlled

-- USERS TABLE POLICIES
-- Everyone can view basic doctor information (for doctor search)
DROP POLICY IF EXISTS "Anyone can view basic doctor info" ON users;
CREATE POLICY "Anyone can view basic doctor info" ON users 
  FOR SELECT USING (role = 'doctor' AND is_active = TRUE);

-- Users can view and edit their own data
DROP POLICY IF EXISTS "Users can view their own data" ON users;
CREATE POLICY "Users can view their own data" ON users 
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own data" ON users;
CREATE POLICY "Users can update their own data" ON users 
  FOR UPDATE USING (auth.uid() = id);

-- Only admin can delete users
DROP POLICY IF EXISTS "Only admins can delete users" ON users;
CREATE POLICY "Only admins can delete users" ON users 
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM users AS admin_users WHERE admin_users.id = auth.uid() AND admin_users.role = 'admin'
  ));

-- Admin can view all user data
DROP POLICY IF EXISTS "Admins can view all user data" ON users;
CREATE POLICY "Admins can view all user data" ON users 
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM users AS admin_users WHERE admin_users.id = auth.uid() AND admin_users.role = 'admin'
  ));

-- APPOINTMENTS TABLE POLICIES
-- Patients and doctors can only see their own appointments
DROP POLICY IF EXISTS "Users see their own appointments" ON appointments;
CREATE POLICY "Users see their own appointments" ON appointments 
  FOR SELECT USING (auth.uid() = patient_id OR auth.uid() = doctor_id);

-- Patients can create appointments
DROP POLICY IF EXISTS "Patients can create appointments" ON appointments;
CREATE POLICY "Patients can create appointments" ON appointments 
  FOR INSERT WITH CHECK (
    auth.uid() = patient_id AND 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'patient')
  );

-- Patients can update only their own appointments that are pending
DROP POLICY IF EXISTS "Patients can update pending appointments" ON appointments;
CREATE POLICY "Patients can update pending appointments" ON appointments 
  FOR UPDATE USING (
    auth.uid() = patient_id AND 
    status = 'pending'
  );

-- Doctors can update appointment status
DROP POLICY IF EXISTS "Doctors can update appointment status" ON appointments;
CREATE POLICY "Doctors can update appointment status" ON appointments 
  FOR UPDATE USING (
    auth.uid() = doctor_id AND 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'doctor')
  );

-- REVIEWS TABLE POLICIES
-- Anyone can view verified reviews for doctors
DROP POLICY IF EXISTS "Anyone can view verified reviews" ON reviews;
CREATE POLICY "Anyone can view verified reviews" ON reviews 
  FOR SELECT USING (is_verified = TRUE);

-- Patients can create reviews for completed appointments
DROP POLICY IF EXISTS "Patients can create reviews for completed appointments" ON reviews;
CREATE POLICY "Patients can create reviews for completed appointments" ON reviews 
  FOR INSERT WITH CHECK (
    auth.uid() = patient_id AND 
    EXISTS (
      SELECT 1 FROM appointments 
      WHERE id = appointment_id 
      AND patient_id = auth.uid() 
      AND status = 'completed'
    )
  );

-- MESSAGES TABLE POLICIES
-- Users can only view messages they sent or received
DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
CREATE POLICY "Users can view their own messages" ON messages 
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can only create messages they are sending
DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages" ON messages 
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Users can only update read status of messages they received
DROP POLICY IF EXISTS "Users can mark messages as read" ON messages;
CREATE POLICY "Users can mark messages as read" ON messages 
  FOR UPDATE 
  USING (auth.uid() = receiver_id)
  WITH CHECK (
    auth.uid() = receiver_id AND 
    read = TRUE
  );

-- NOTIFICATIONS TABLE POLICIES
-- Users can only view their own notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" ON notifications 
  FOR SELECT USING (auth.uid() = user_id);

-- Users can mark their notifications as read
DROP POLICY IF EXISTS "Users can mark notifications as read" ON notifications;
CREATE POLICY "Users can mark notifications as read" ON notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND 
    read = TRUE
  );

-- PAYMENT DETAILS TABLE POLICIES
-- Patients can view their own payment details
DROP POLICY IF EXISTS "Patients can view their payment details" ON payment_details;
CREATE POLICY "Patients can view their payment details" ON payment_details 
  FOR SELECT USING (auth.uid() = patient_id);

-- System can create payment details (enforced through service roles in the backend)
DROP POLICY IF EXISTS "System can create payment details" ON payment_details;
CREATE POLICY "System can create payment details" ON payment_details 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM appointments 
      WHERE id = appointment_id 
      AND patient_id = auth.uid()
    )
  );

-- TIME SLOTS TABLE POLICIES
-- Anyone can view available time slots
DROP POLICY IF EXISTS "Anyone can view available time slots" ON time_slots;
CREATE POLICY "Anyone can view available time slots" ON time_slots 
  FOR SELECT USING (TRUE);

-- Doctors can manage their own time slots
DROP POLICY IF EXISTS "Doctors can manage their time slots" ON time_slots;
CREATE POLICY "Doctors can manage their time slots" ON time_slots 
  FOR ALL USING (
    auth.uid() = doctor_id AND 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'doctor')
  );

-- HEALTH RECORDS TABLE POLICIES
-- Patients can view their own health records
DROP POLICY IF EXISTS "Patients can view their own health records" ON health_records;
CREATE POLICY "Patients can view their own health records" ON health_records 
  FOR SELECT USING (auth.uid() = patient_id);

-- Doctors who created the record can view it
DROP POLICY IF EXISTS "Doctors can view records they created" ON health_records;
CREATE POLICY "Doctors can view records they created" ON health_records 
  FOR SELECT USING (auth.uid() = doctor_id);

-- Doctors can create health records for their patients
DROP POLICY IF EXISTS "Doctors can create health records" ON health_records;
CREATE POLICY "Doctors can create health records" ON health_records 
  FOR INSERT WITH CHECK (
    auth.uid() = doctor_id AND 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'doctor') AND
    EXISTS (
      SELECT 1 FROM appointments 
      WHERE doctor_id = auth.uid() 
      AND patient_id = health_records.patient_id
    )
  );

-- MEDICAL HISTORY TABLE POLICIES
-- Patients can view and manage their own medical history
DROP POLICY IF EXISTS "Patients can view their medical history" ON medical_history;
CREATE POLICY "Patients can view their medical history" ON medical_history 
  FOR SELECT USING (auth.uid() = patient_id);

DROP POLICY IF EXISTS "Patients can manage their medical history" ON medical_history;
CREATE POLICY "Patients can manage their medical history" ON medical_history 
  FOR ALL USING (auth.uid() = patient_id);

-- Doctors can view medical history of their patients
DROP POLICY IF EXISTS "Doctors can view patient medical history" ON medical_history;
CREATE POLICY "Doctors can view patient medical history" ON medical_history 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM appointments 
      WHERE doctor_id = auth.uid() 
      AND patient_id = medical_history.patient_id
    )
  );

-- PRESCRIPTIONS TABLE POLICIES
-- Patients can view their own prescriptions
DROP POLICY IF EXISTS "Patients can view their prescriptions" ON prescriptions;
CREATE POLICY "Patients can view their prescriptions" ON prescriptions 
  FOR SELECT USING (auth.uid() = patient_id);

-- Doctors can view and create prescriptions for their patients
DROP POLICY IF EXISTS "Doctors can view prescriptions they created" ON prescriptions;
CREATE POLICY "Doctors can view prescriptions they created" ON prescriptions 
  FOR SELECT USING (auth.uid() = doctor_id);

DROP POLICY IF EXISTS "Doctors can create prescriptions" ON prescriptions;
CREATE POLICY "Doctors can create prescriptions" ON prescriptions 
  FOR INSERT WITH CHECK (
    auth.uid() = doctor_id AND 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'doctor') AND
    EXISTS (
      SELECT 1 FROM appointments 
      WHERE id = appointment_id 
      AND doctor_id = auth.uid()
    )
  );

-- HELPER FUNCTIONS
-- Get appointments for a doctor
CREATE OR REPLACE FUNCTION get_doctor_appointments(doctor_id UUID)
RETURNS SETOF appointments
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.appointments 
  WHERE appointments.doctor_id = get_doctor_appointments.doctor_id
  ORDER BY date ASC;
$$;

-- Get appointments for a patient
CREATE OR REPLACE FUNCTION get_patient_appointments(patient_id UUID)
RETURNS SETOF appointments
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.appointments 
  WHERE appointments.patient_id = get_patient_appointments.patient_id
  ORDER BY date ASC;
$$;

-- Create data encryption functions for PHI (Protected Health Information)
CREATE OR REPLACE FUNCTION encrypt_phi(data TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN pgp_sym_encrypt(data, current_setting('app.jwt_secret'));
END;
$$;

CREATE OR REPLACE FUNCTION decrypt_phi(encrypted_data TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN pgp_sym_decrypt(encrypted_data, current_setting('app.jwt_secret'));
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$;