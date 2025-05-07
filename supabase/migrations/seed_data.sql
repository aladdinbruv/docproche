-- Seed script for DocProche database
-- Run this after the initial schema has been applied

-- Insert Admin User
INSERT INTO public.users (email, full_name, role, phone_number, email_verified, is_active)
VALUES ('admin@doctoproche.com', 'Admin User', 'admin', '+11234567890', TRUE, TRUE);

-- Insert Doctors
INSERT INTO public.users (email, full_name, role, phone_number, profile_image, specialty, years_of_experience, 
                          education, bio, consultation_fee, available_days, email_verified, is_active)
VALUES 
('dr.smith@doctoproche.com', 'Dr. John Smith', 'doctor', '+12025550191', 
 'https://randomuser.me/api/portraits/men/42.jpg', 'Cardiology', 15, 
 'MD from Johns Hopkins University', 
 'Experienced cardiologist with a focus on preventative care and heart health management.',
 150.00, ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], TRUE, TRUE),

('dr.patel@doctoproche.com', 'Dr. Priya Patel', 'doctor', '+12025550192', 
 'https://randomuser.me/api/portraits/women/28.jpg', 'Pediatrics', 8, 
 'MD from University of California, San Francisco', 
 'Dedicated pediatrician passionate about child wellness and development.',
 120.00, ARRAY['Monday', 'Wednesday', 'Friday'], TRUE, TRUE),

('dr.johnson@doctoproche.com', 'Dr. Michael Johnson', 'doctor', '+12025550193', 
 'https://randomuser.me/api/portraits/men/32.jpg', 'Dermatology', 12, 
 'MD from Harvard Medical School', 
 'Board-certified dermatologist specializing in skin cancer prevention and treatment.',
 180.00, ARRAY['Tuesday', 'Thursday', 'Saturday'], TRUE, TRUE),

('dr.williams@doctoproche.com', 'Dr. Sarah Williams', 'doctor', '+12025550194', 
 'https://randomuser.me/api/portraits/women/24.jpg', 'Psychiatry', 10, 
 'MD from Yale School of Medicine', 
 'Compassionate psychiatrist focusing on anxiety, depression, and stress management.',
 200.00, ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday'], TRUE, TRUE),

('dr.garcia@doctoproche.com', 'Dr. Carlos Garcia', 'doctor', '+12025550195', 
 'https://randomuser.me/api/portraits/men/29.jpg', 'Orthopedics', 14, 
 'MD from Stanford University School of Medicine', 
 'Orthopedic surgeon specializing in sports injuries and joint replacements.',
 190.00, ARRAY['Wednesday', 'Thursday', 'Friday'], TRUE, TRUE);

-- Insert Patients
INSERT INTO public.users (email, full_name, role, phone_number, profile_image, email_verified, is_active)
VALUES 
('patient1@example.com', 'Emma Wilson', 'patient', '+12025550101', 
 'https://randomuser.me/api/portraits/women/45.jpg', TRUE, TRUE),

('patient2@example.com', 'James Brown', 'patient', '+12025550102', 
 'https://randomuser.me/api/portraits/men/36.jpg', TRUE, TRUE),

('patient3@example.com', 'Olivia Martinez', 'patient', '+12025550103', 
 'https://randomuser.me/api/portraits/women/32.jpg', TRUE, TRUE),

('patient4@example.com', 'Noah Taylor', 'patient', '+12025550104', 
 'https://randomuser.me/api/portraits/men/22.jpg', TRUE, TRUE),

('patient5@example.com', 'Sophia Anderson', 'patient', '+12025550105', 
 'https://randomuser.me/api/portraits/women/18.jpg', TRUE, TRUE),

('patient6@example.com', 'Liam Thomas', 'patient', '+12025550106', 
 'https://randomuser.me/api/portraits/men/41.jpg', TRUE, TRUE),

('patient7@example.com', 'Ava Rodriguez', 'patient', '+12025550107', 
 'https://randomuser.me/api/portraits/women/63.jpg', TRUE, TRUE),

('patient8@example.com', 'William Harris', 'patient', '+12025550108', 
 'https://randomuser.me/api/portraits/men/53.jpg', TRUE, TRUE);

-- Create Time Slots for Doctors
-- Get IDs for inserted doctors
DO $$
DECLARE 
    smith_id UUID;
    patel_id UUID;
    johnson_id UUID;
    williams_id UUID;
    garcia_id UUID;
BEGIN
    SELECT id INTO smith_id FROM public.users WHERE email = 'dr.smith@doctoproche.com';
    SELECT id INTO patel_id FROM public.users WHERE email = 'dr.patel@doctoproche.com';
    SELECT id INTO johnson_id FROM public.users WHERE email = 'dr.johnson@doctoproche.com';
    SELECT id INTO williams_id FROM public.users WHERE email = 'dr.williams@doctoproche.com';
    SELECT id INTO garcia_id FROM public.users WHERE email = 'dr.garcia@doctoproche.com';

    -- Insert time slots for Dr. Smith (Monday, Tuesday, Wednesday, Thursday, Friday)
    INSERT INTO public.time_slots (doctor_id, day_of_week, start_time, end_time, is_available)
    VALUES 
    (smith_id, 1, '09:00', '10:00', TRUE),
    (smith_id, 1, '10:00', '11:00', TRUE),
    (smith_id, 1, '11:00', '12:00', TRUE),
    (smith_id, 1, '14:00', '15:00', TRUE),
    (smith_id, 1, '15:00', '16:00', TRUE),
    (smith_id, 2, '09:00', '10:00', TRUE),
    (smith_id, 2, '10:00', '11:00', TRUE),
    (smith_id, 2, '11:00', '12:00', TRUE),
    (smith_id, 2, '14:00', '15:00', TRUE),
    (smith_id, 2, '15:00', '16:00', TRUE),
    (smith_id, 3, '09:00', '10:00', TRUE),
    (smith_id, 3, '10:00', '11:00', TRUE),
    (smith_id, 3, '11:00', '12:00', TRUE),
    (smith_id, 3, '14:00', '15:00', TRUE),
    (smith_id, 3, '15:00', '16:00', TRUE),
    (smith_id, 4, '09:00', '10:00', TRUE),
    (smith_id, 4, '10:00', '11:00', TRUE),
    (smith_id, 4, '11:00', '12:00', TRUE),
    (smith_id, 4, '14:00', '15:00', TRUE),
    (smith_id, 4, '15:00', '16:00', TRUE),
    (smith_id, 5, '09:00', '10:00', TRUE),
    (smith_id, 5, '10:00', '11:00', TRUE),
    (smith_id, 5, '11:00', '12:00', TRUE),
    (smith_id, 5, '14:00', '15:00', TRUE),
    (smith_id, 5, '15:00', '16:00', TRUE);

    -- Insert time slots for Dr. Patel (Monday, Wednesday, Friday)
    INSERT INTO public.time_slots (doctor_id, day_of_week, start_time, end_time, is_available)
    VALUES 
    (patel_id, 1, '08:00', '09:00', TRUE),
    (patel_id, 1, '09:00', '10:00', TRUE),
    (patel_id, 1, '10:00', '11:00', TRUE),
    (patel_id, 1, '11:00', '12:00', TRUE),
    (patel_id, 1, '13:00', '14:00', TRUE),
    (patel_id, 1, '14:00', '15:00', TRUE),
    (patel_id, 3, '08:00', '09:00', TRUE),
    (patel_id, 3, '09:00', '10:00', TRUE),
    (patel_id, 3, '10:00', '11:00', TRUE),
    (patel_id, 3, '11:00', '12:00', TRUE),
    (patel_id, 3, '13:00', '14:00', TRUE),
    (patel_id, 3, '14:00', '15:00', TRUE),
    (patel_id, 5, '08:00', '09:00', TRUE),
    (patel_id, 5, '09:00', '10:00', TRUE),
    (patel_id, 5, '10:00', '11:00', TRUE),
    (patel_id, 5, '11:00', '12:00', TRUE),
    (patel_id, 5, '13:00', '14:00', TRUE),
    (patel_id, 5, '14:00', '15:00', TRUE);

    -- Insert time slots for Dr. Johnson (Tuesday, Thursday, Saturday)
    INSERT INTO public.time_slots (doctor_id, day_of_week, start_time, end_time, is_available)
    VALUES 
    (johnson_id, 2, '10:00', '11:00', TRUE),
    (johnson_id, 2, '11:00', '12:00', TRUE),
    (johnson_id, 2, '12:00', '13:00', TRUE),
    (johnson_id, 2, '14:00', '15:00', TRUE),
    (johnson_id, 2, '15:00', '16:00', TRUE),
    (johnson_id, 2, '16:00', '17:00', TRUE),
    (johnson_id, 4, '10:00', '11:00', TRUE),
    (johnson_id, 4, '11:00', '12:00', TRUE),
    (johnson_id, 4, '12:00', '13:00', TRUE),
    (johnson_id, 4, '14:00', '15:00', TRUE),
    (johnson_id, 4, '15:00', '16:00', TRUE),
    (johnson_id, 4, '16:00', '17:00', TRUE),
    (johnson_id, 6, '10:00', '11:00', TRUE),
    (johnson_id, 6, '11:00', '12:00', TRUE),
    (johnson_id, 6, '12:00', '13:00', TRUE),
    (johnson_id, 6, '14:00', '15:00', TRUE),
    (johnson_id, 6, '15:00', '16:00', TRUE);

    -- Insert time slots for other doctors...
    -- Dr. Williams (Monday, Tuesday, Wednesday, Thursday)
    INSERT INTO public.time_slots (doctor_id, day_of_week, start_time, end_time, is_available)
    VALUES 
    (williams_id, 1, '12:00', '13:00', TRUE),
    (williams_id, 1, '13:00', '14:00', TRUE),
    (williams_id, 1, '14:00', '15:00', TRUE),
    (williams_id, 1, '15:00', '16:00', TRUE),
    (williams_id, 1, '16:00', '17:00', TRUE),
    (williams_id, 2, '12:00', '13:00', TRUE),
    (williams_id, 2, '13:00', '14:00', TRUE),
    (williams_id, 2, '14:00', '15:00', TRUE),
    (williams_id, 2, '15:00', '16:00', TRUE),
    (williams_id, 2, '16:00', '17:00', TRUE),
    (williams_id, 3, '12:00', '13:00', TRUE),
    (williams_id, 3, '13:00', '14:00', TRUE),
    (williams_id, 3, '14:00', '15:00', TRUE),
    (williams_id, 3, '15:00', '16:00', TRUE),
    (williams_id, 3, '16:00', '17:00', TRUE),
    (williams_id, 4, '12:00', '13:00', TRUE),
    (williams_id, 4, '13:00', '14:00', TRUE),
    (williams_id, 4, '14:00', '15:00', TRUE),
    (williams_id, 4, '15:00', '16:00', TRUE),
    (williams_id, 4, '16:00', '17:00', TRUE);

    -- Dr. Garcia (Wednesday, Thursday, Friday)
    INSERT INTO public.time_slots (doctor_id, day_of_week, start_time, end_time, is_available)
    VALUES 
    (garcia_id, 3, '08:00', '09:00', TRUE),
    (garcia_id, 3, '09:00', '10:00', TRUE),
    (garcia_id, 3, '10:00', '11:00', TRUE),
    (garcia_id, 3, '11:00', '12:00', TRUE),
    (garcia_id, 3, '14:00', '15:00', TRUE),
    (garcia_id, 3, '15:00', '16:00', TRUE),
    (garcia_id, 3, '16:00', '17:00', TRUE),
    (garcia_id, 4, '08:00', '09:00', TRUE),
    (garcia_id, 4, '09:00', '10:00', TRUE),
    (garcia_id, 4, '10:00', '11:00', TRUE),
    (garcia_id, 4, '11:00', '12:00', TRUE),
    (garcia_id, 4, '14:00', '15:00', TRUE),
    (garcia_id, 4, '15:00', '16:00', TRUE),
    (garcia_id, 4, '16:00', '17:00', TRUE),
    (garcia_id, 5, '08:00', '09:00', TRUE),
    (garcia_id, 5, '09:00', '10:00', TRUE),
    (garcia_id, 5, '10:00', '11:00', TRUE),
    (garcia_id, 5, '11:00', '12:00', TRUE),
    (garcia_id, 5, '14:00', '15:00', TRUE),
    (garcia_id, 5, '15:00', '16:00', TRUE),
    (garcia_id, 5, '16:00', '17:00', TRUE);
END $$;

-- Create Appointments
DO $$
DECLARE
    patient1_id UUID;
    patient2_id UUID;
    patient3_id UUID;
    patient4_id UUID;
    patient5_id UUID;
    smith_id UUID;
    patel_id UUID;
    johnson_id UUID;
    williams_id UUID;
    garcia_id UUID;
    app_id1 UUID;
    app_id2 UUID;
    app_id3 UUID;
    app_id4 UUID;
    app_id5 UUID;
    app_id6 UUID;
BEGIN
    -- Get user IDs
    SELECT id INTO patient1_id FROM public.users WHERE email = 'patient1@example.com';
    SELECT id INTO patient2_id FROM public.users WHERE email = 'patient2@example.com';
    SELECT id INTO patient3_id FROM public.users WHERE email = 'patient3@example.com';
    SELECT id INTO patient4_id FROM public.users WHERE email = 'patient4@example.com';
    SELECT id INTO patient5_id FROM public.users WHERE email = 'patient5@example.com';
    SELECT id INTO smith_id FROM public.users WHERE email = 'dr.smith@doctoproche.com';
    SELECT id INTO patel_id FROM public.users WHERE email = 'dr.patel@doctoproche.com';
    SELECT id INTO johnson_id FROM public.users WHERE email = 'dr.johnson@doctoproche.com';
    SELECT id INTO williams_id FROM public.users WHERE email = 'dr.williams@doctoproche.com';
    SELECT id INTO garcia_id FROM public.users WHERE email = 'dr.garcia@doctoproche.com';

    -- Past completed appointments
    INSERT INTO public.appointments (
        patient_id, doctor_id, date, time_slot, status, consultation_type, 
        symptoms, notes, payment_status, created_at
    ) 
    VALUES (
        patient1_id, smith_id, '2023-12-10', '10:00-11:00', 'completed', 'in-person',
        'Chest pain, shortness of breath', 'Patient has history of hypertension', 'paid',
        '2023-12-01 10:00:00+00'
    ) RETURNING id INTO app_id1;

    INSERT INTO public.appointments (
        patient_id, doctor_id, date, time_slot, status, consultation_type, 
        symptoms, notes, payment_status, created_at
    ) 
    VALUES (
        patient2_id, patel_id, '2024-01-15', '09:00-10:00', 'completed', 'in-person',
        'Fever, cough', 'Seasonal flu symptoms', 'paid',
        '2024-01-10 14:30:00+00'
    ) RETURNING id INTO app_id2;

    INSERT INTO public.appointments (
        patient_id, doctor_id, date, time_slot, status, consultation_type, 
        symptoms, notes, payment_status, created_at
    ) 
    VALUES (
        patient3_id, johnson_id, '2024-02-20', '11:00-12:00', 'completed', 'video',
        'Skin rash', 'Potential allergic reaction', 'paid',
        '2024-02-15 09:15:00+00'
    ) RETURNING id INTO app_id3;

    -- Current upcoming appointments
    INSERT INTO public.appointments (
        patient_id, doctor_id, date, time_slot, status, consultation_type, 
        symptoms, notes, payment_status, created_at
    ) 
    VALUES (
        patient1_id, williams_id, '2024-05-05', '13:00-14:00', 'confirmed', 'video',
        'Anxiety, trouble sleeping', 'Follow-up appointment', 'paid',
        '2024-04-20 16:45:00+00'
    ) RETURNING id INTO app_id4;

    INSERT INTO public.appointments (
        patient_id, doctor_id, date, time_slot, status, consultation_type, 
        symptoms, notes, payment_status, created_at
    ) 
    VALUES (
        patient4_id, garcia_id, '2024-05-10', '10:00-11:00', 'confirmed', 'in-person',
        'Knee pain', 'Sports injury', 'paid',
        '2024-04-25 11:30:00+00'
    ) RETURNING id INTO app_id5;

    INSERT INTO public.appointments (
        patient_id, doctor_id, date, time_slot, status, consultation_type, 
        symptoms, notes, payment_status, created_at
    ) 
    VALUES (
        patient5_id, smith_id, '2024-05-15', '14:00-15:00', 'pending', 'in-person',
        'Heart palpitations', 'First consultation', 'unpaid',
        '2024-04-30 08:20:00+00'
    ) RETURNING id INTO app_id6;

    -- Insert payment details for paid appointments
    INSERT INTO public.payment_details (
        appointment_id, patient_id, amount, currency, payment_method, payment_status, transaction_id
    )
    VALUES 
    (app_id1, patient1_id, 150.00, 'USD', 'credit_card', 'successful', 'txn_12345678'),
    (app_id2, patient2_id, 120.00, 'USD', 'credit_card', 'successful', 'txn_23456789'),
    (app_id3, patient3_id, 180.00, 'USD', 'paypal', 'successful', 'txn_34567890'),
    (app_id4, patient1_id, 200.00, 'USD', 'credit_card', 'successful', 'txn_45678901'),
    (app_id5, patient4_id, 190.00, 'USD', 'credit_card', 'successful', 'txn_56789012');

    -- Insert reviews for completed appointments
    INSERT INTO public.reviews (
        patient_id, doctor_id, appointment_id, rating, comment, is_verified
    )
    VALUES 
    (patient1_id, smith_id, app_id1, 5, 'Dr. Smith was very thorough and professional. Highly recommended!', TRUE),
    (patient2_id, patel_id, app_id2, 4, 'Dr. Patel was great with my child. Very patient and knowledgeable.', TRUE),
    (patient3_id, johnson_id, app_id3, 5, 'Dr. Johnson diagnosed my condition quickly and provided effective treatment.', TRUE);

    -- Insert health records
    INSERT INTO public.health_records (
        patient_id, doctor_id, appointment_id, record_type, title, description
    )
    VALUES 
    (patient1_id, smith_id, app_id1, 'ECG', 'Electrocardiogram Results', 'Normal sinus rhythm. No significant ST changes.'),
    (patient1_id, smith_id, app_id1, 'Blood Test', 'Complete Blood Count', 'All values within normal range.'),
    (patient2_id, patel_id, app_id2, 'Vaccination', 'Flu Vaccine', 'Annual influenza vaccination administered.'),
    (patient3_id, johnson_id, app_id3, 'Image', 'Skin Condition Photo', 'Images of allergic reaction for reference and tracking.');

    -- Insert medical history
    INSERT INTO public.medical_history (
        patient_id, history_type, description, diagnosed_date, is_current
    )
    VALUES 
    (patient1_id, 'Chronic Condition', 'Hypertension', '2020-05-10', TRUE),
    (patient1_id, 'Surgery', 'Appendectomy', '2015-08-22', FALSE),
    (patient2_id, 'Allergy', 'Penicillin Allergy', '2018-03-15', TRUE),
    (patient3_id, 'Chronic Condition', 'Eczema', '2019-11-05', TRUE),
    (patient4_id, 'Injury', 'ACL Tear - Right Knee', '2022-06-30', TRUE);

    -- Insert prescriptions
    INSERT INTO public.prescriptions (
        patient_id, doctor_id, appointment_id, medications, instructions, issue_date, expiry_date, is_active
    )
    VALUES 
    (patient1_id, smith_id, app_id1, 
     '[{"name": "Lisinopril", "dosage": "10mg", "frequency": "Once daily"}]'::JSONB,
     'Take in the morning with food. Monitor blood pressure regularly.',
     '2023-12-10', '2024-03-10', FALSE),
    
    (patient3_id, johnson_id, app_id3,
     '[{"name": "Hydrocortisone Cream", "dosage": "1%", "frequency": "Twice daily"}, {"name": "Cetirizine", "dosage": "10mg", "frequency": "Once daily"}]'::JSONB,
     'Apply cream to affected areas. Take antihistamine before bed if needed.',
     '2024-02-20', '2024-05-20', TRUE);

    -- Insert messages between patients and doctors
    INSERT INTO public.messages (
        sender_id, receiver_id, appointment_id, content, read, created_at
    )
    VALUES 
    (patient1_id, smith_id, app_id1, 'Hello Dr. Smith, I have a question about my medication. Is there a specific time I should take it?', TRUE, '2023-12-15 10:30:00+00'),
    (smith_id, patient1_id, app_id1, 'Hello Emma, it''s best to take your medication in the morning with breakfast. Let me know if you experience any side effects.', TRUE, '2023-12-15 14:45:00+00'),
    (patient1_id, smith_id, app_id1, 'Thank you, Dr. Smith. I''ll follow your advice.', TRUE, '2023-12-15 15:20:00+00'),
    
    (patient3_id, johnson_id, app_id3, 'Dr. Johnson, the rash is improving but I''m still experiencing some itching. Should I continue with the current medication?', TRUE, '2024-02-25 09:10:00+00'),
    (johnson_id, patient3_id, app_id3, 'Hi Olivia, yes please continue the medication for the full course. The itching should subside in a few days. If it persists for more than a week, we might need to adjust the treatment.', TRUE, '2024-02-25 11:35:00+00'),
    
    (patient4_id, garcia_id, app_id5, 'I''m looking forward to my appointment next week. Should I bring my previous X-rays?', FALSE, '2024-05-02 16:40:00+00');

    -- Insert notifications
    INSERT INTO public.notifications (
        user_id, title, message, type, read, related_id, created_at
    )
    VALUES 
    (patient1_id, 'Upcoming Appointment', 'Reminder: You have an appointment with Dr. Williams tomorrow at 1:00 PM.', 'appointment', FALSE, app_id4::TEXT, '2024-05-04 10:00:00+00'),
    (patient4_id, 'Appointment Confirmation', 'Your appointment with Dr. Garcia has been confirmed for May 10th at 10:00 AM.', 'appointment', TRUE, app_id5::TEXT, '2024-04-25 11:35:00+00'),
    (patient5_id, 'Payment Required', 'Please complete payment for your upcoming appointment with Dr. Smith.', 'system', FALSE, app_id6::TEXT, '2024-04-30 08:25:00+00'),
    (patient3_id, 'New Message', 'You have a new message from Dr. Johnson.', 'message', TRUE, NULL, '2024-02-25 11:35:00+00'),
    (smith_id, 'New Appointment Request', 'Sophia Anderson has requested an appointment on May 15th at 2:00 PM.', 'appointment', TRUE, app_id6::TEXT, '2024-04-30 08:20:00+00');
END $$;

-- Add time slots for doctors
INSERT INTO public.time_slots (id, doctor_id, day_of_week, start_time, end_time, is_available)
VALUES
  -- Doctor 1 time slots (Monday)
  (uuid_generate_v4(), (SELECT id FROM public.users WHERE role = 'doctor' LIMIT 1 OFFSET 0), 1, '09:00', '10:00', true),
  (uuid_generate_v4(), (SELECT id FROM public.users WHERE role = 'doctor' LIMIT 1 OFFSET 0), 1, '10:00', '11:00', true),
  (uuid_generate_v4(), (SELECT id FROM public.users WHERE role = 'doctor' LIMIT 1 OFFSET 0), 1, '11:00', '12:00', true),
  (uuid_generate_v4(), (SELECT id FROM public.users WHERE role = 'doctor' LIMIT 1 OFFSET 0), 1, '14:00', '15:00', true),
  (uuid_generate_v4(), (SELECT id FROM public.users WHERE role = 'doctor' LIMIT 1 OFFSET 0), 1, '15:00', '16:00', true),
  
  -- Doctor 1 time slots (Wednesday)
  (uuid_generate_v4(), (SELECT id FROM public.users WHERE role = 'doctor' LIMIT 1 OFFSET 0), 3, '09:00', '10:00', true),
  (uuid_generate_v4(), (SELECT id FROM public.users WHERE role = 'doctor' LIMIT 1 OFFSET 0), 3, '10:00', '11:00', true),
  (uuid_generate_v4(), (SELECT id FROM public.users WHERE role = 'doctor' LIMIT 1 OFFSET 0), 3, '11:00', '12:00', true),
  (uuid_generate_v4(), (SELECT id FROM public.users WHERE role = 'doctor' LIMIT 1 OFFSET 0), 3, '14:00', '15:00', true),
  (uuid_generate_v4(), (SELECT id FROM public.users WHERE role = 'doctor' LIMIT 1 OFFSET 0), 3, '15:00', '16:00', true),
  
  -- Doctor 1 time slots (Friday)
  (uuid_generate_v4(), (SELECT id FROM public.users WHERE role = 'doctor' LIMIT 1 OFFSET 0), 5, '09:00', '10:00', true),
  (uuid_generate_v4(), (SELECT id FROM public.users WHERE role = 'doctor' LIMIT 1 OFFSET 0), 5, '10:00', '11:00', true),
  (uuid_generate_v4(), (SELECT id FROM public.users WHERE role = 'doctor' LIMIT 1 OFFSET 0), 5, '11:00', '12:00', true),
  (uuid_generate_v4(), (SELECT id FROM public.users WHERE role = 'doctor' LIMIT 1 OFFSET 0), 5, '14:00', '15:00', true),
  (uuid_generate_v4(), (SELECT id FROM public.users WHERE role = 'doctor' LIMIT 1 OFFSET 0), 5, '15:00', '16:00', true),
  
  -- Doctor 2 time slots (Tuesday)
  (uuid_generate_v4(), (SELECT id FROM public.users WHERE role = 'doctor' LIMIT 1 OFFSET 1), 2, '08:00', '09:00', true),
  (uuid_generate_v4(), (SELECT id FROM public.users WHERE role = 'doctor' LIMIT 1 OFFSET 1), 2, '09:00', '10:00', true),
  (uuid_generate_v4(), (SELECT id FROM public.users WHERE role = 'doctor' LIMIT 1 OFFSET 1), 2, '10:00', '11:00', true),
  (uuid_generate_v4(), (SELECT id FROM public.users WHERE role = 'doctor' LIMIT 1 OFFSET 1), 2, '13:00', '14:00', true),
  (uuid_generate_v4(), (SELECT id FROM public.users WHERE role = 'doctor' LIMIT 1 OFFSET 1), 2, '14:00', '15:00', true),
  
  -- Doctor 2 time slots (Thursday)
  (uuid_generate_v4(), (SELECT id FROM public.users WHERE role = 'doctor' LIMIT 1 OFFSET 1), 4, '08:00', '09:00', true),
  (uuid_generate_v4(), (SELECT id FROM public.users WHERE role = 'doctor' LIMIT 1 OFFSET 1), 4, '09:00', '10:00', true),
  (uuid_generate_v4(), (SELECT id FROM public.users WHERE role = 'doctor' LIMIT 1 OFFSET 1), 4, '10:00', '11:00', true),
  (uuid_generate_v4(), (SELECT id FROM public.users WHERE role = 'doctor' LIMIT 1 OFFSET 1), 4, '13:00', '14:00', true),
  (uuid_generate_v4(), (SELECT id FROM public.users WHERE role = 'doctor' LIMIT 1 OFFSET 1), 4, '14:00', '15:00', true); 