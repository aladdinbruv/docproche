-- Create required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('doctor', 'patient')),
  full_name TEXT NOT NULL,
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Doctor profiles
CREATE TABLE IF NOT EXISTS public.doctor_profiles (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  specialty TEXT NOT NULL,
  years_experience INTEGER NOT NULL,
  location TEXT NOT NULL,
  bio TEXT,
  profile_picture TEXT,
  rating NUMERIC(3,2) DEFAULT 0.0
);

-- Appointments
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL, -- Using TEXT for flexibility, can be converted to DATE if needed
  time TEXT NOT NULL, -- Using TEXT, can be converted to TIME if needed
  mode TEXT NOT NULL CHECK (mode IN ('in-person', 'video')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'cancelled', 'completed')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid'))
);

-- Prescriptions
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  transaction_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('successful', 'failed')),
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Users RLS
CREATE POLICY "Users can view their own data" ON public.users 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON public.users 
  FOR UPDATE USING (auth.uid() = id);

-- Doctor Profiles RLS
CREATE POLICY "Anyone can view doctor profiles" ON public.doctor_profiles 
  FOR SELECT USING (true);

CREATE POLICY "Doctors can update their own profiles" ON public.doctor_profiles 
  FOR UPDATE USING (auth.uid() = user_id);

-- Appointments RLS
CREATE POLICY "Doctors and patients can view their appointments" ON public.appointments 
  FOR SELECT USING (auth.uid() = doctor_id OR auth.uid() = patient_id);

CREATE POLICY "Patients can create appointments" ON public.appointments 
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Doctors can update appointment status" ON public.appointments 
  FOR UPDATE USING (auth.uid() = doctor_id);

-- Prescriptions RLS
CREATE POLICY "Doctors and patients can view their prescriptions" ON public.prescriptions 
  FOR SELECT USING (auth.uid() = doctor_id OR auth.uid() = patient_id);

CREATE POLICY "Doctors can create prescriptions" ON public.prescriptions 
  FOR INSERT WITH CHECK (auth.uid() = doctor_id);

-- Messages RLS
CREATE POLICY "Users can view messages they sent or received" ON public.messages 
  FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can send messages" ON public.messages 
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);

-- Payments RLS
CREATE POLICY "Patients can view their own payments" ON public.payments 
  FOR SELECT USING (
    auth.uid() IN (
      SELECT patient_id FROM public.appointments 
      WHERE id = appointment_id
    )
  );

-- Create functions for better querying
CREATE OR REPLACE FUNCTION get_doctor_appointments(doctor_id UUID)
RETURNS SETOF appointments
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.appointments WHERE appointments.doctor_id = get_doctor_appointments.doctor_id
  ORDER BY date ASC;
$$;

CREATE OR REPLACE FUNCTION get_patient_appointments(patient_id UUID)
RETURNS SETOF appointments
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.appointments WHERE appointments.patient_id = get_patient_appointments.patient_id
  ORDER BY date ASC;
$$; 