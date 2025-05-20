-- Create functions for doctor dashboard analytics
CREATE OR REPLACE FUNCTION get_doctor_analytics(doctor_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Aggregate the stats for doctor dashboard
  WITH total_appointments AS (
    SELECT COUNT(*) as count
    FROM appointments
    WHERE doctor_id = $1
  ),
  pending_appointments AS (
    SELECT COUNT(*) as count
    FROM appointments
    WHERE doctor_id = $1 AND status = 'pending'
  ),
  completed_appointments AS (
    SELECT COUNT(*) as count
    FROM appointments
    WHERE doctor_id = $1 AND status = 'completed'
  ),
  total_patients AS (
    SELECT COUNT(DISTINCT patient_id) as count
    FROM appointments
    WHERE doctor_id = $1
  ),
  recent_appointments AS (
    SELECT 
      a.id,
      a.date,
      a.time_slot,
      a.status,
      a.consultation_type,
      jsonb_build_object(
        'id', u.id,
        'full_name', u.full_name,
        'email', u.email,
        'phone_number', u.phone_number,
        'profile_image', u.profile_image
      ) as patient
    FROM appointments a
    JOIN users u ON a.patient_id = u.id
    WHERE a.doctor_id = $1
    ORDER BY a.created_at DESC
    LIMIT 5
  ),
  total_revenue AS (
    SELECT COALESCE(SUM(amount), 0) as sum
    FROM payment_details
    JOIN appointments ON payment_details.appointment_id = appointments.id
    WHERE appointments.doctor_id = $1 AND payment_details.payment_status = 'successful'
  ),
  monthly_revenue AS (
    SELECT COALESCE(SUM(amount), 0) as sum
    FROM payment_details
    JOIN appointments ON payment_details.appointment_id = appointments.id
    WHERE 
      appointments.doctor_id = $1 
      AND payment_details.payment_status = 'successful'
      AND payment_details.created_at >= date_trunc('month', CURRENT_DATE)
  ),
  latest_reviews AS (
    SELECT 
      r.id,
      r.rating,
      r.comment,
      r.created_at,
      jsonb_build_object(
        'id', u.id,
        'full_name', u.full_name,
        'profile_image', u.profile_image
      ) as patient
    FROM reviews r
    JOIN users u ON r.patient_id = u.id
    WHERE r.doctor_id = $1
    ORDER BY r.created_at DESC
    LIMIT 5
  )
  SELECT 
    jsonb_build_object(
      'total_appointments', (SELECT count FROM total_appointments),
      'pending_appointments', (SELECT count FROM pending_appointments),
      'completed_appointments', (SELECT count FROM completed_appointments),
      'total_patients', (SELECT count FROM total_patients),
      'recent_appointments', (SELECT jsonb_agg(recent_appointments) FROM recent_appointments),
      'total_revenue', (SELECT sum FROM total_revenue),
      'monthly_revenue', (SELECT sum FROM monthly_revenue),
      'latest_reviews', (SELECT jsonb_agg(latest_reviews) FROM latest_reviews)
    ) INTO result;

  RETURN result;
END;
$$;

-- Create function to get a doctor's patients with appointment information
CREATE OR REPLACE FUNCTION get_doctor_patients(doctor_id UUID)
RETURNS SETOF JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH doctor_patients AS (
    SELECT DISTINCT patient_id
    FROM appointments
    WHERE doctor_id = $1
  ),
  patient_details AS (
    SELECT 
      u.id,
      u.full_name,
      u.email,
      u.phone_number,
      u.profile_image,
      (
        SELECT jsonb_build_object(
          'id', a.id,
          'date', a.date,
          'time_slot', a.time_slot,
          'status', a.status,
          'consultation_type', a.consultation_type
        )
        FROM appointments a
        WHERE a.patient_id = u.id AND a.doctor_id = $1
        ORDER BY a.date DESC, a.time_slot DESC
        LIMIT 1
      ) as latest_appointment,
      (
        SELECT COUNT(*)
        FROM appointments a
        WHERE a.patient_id = u.id AND a.doctor_id = $1
      ) as appointment_count
    FROM users u
    JOIN doctor_patients dp ON u.id = dp.patient_id
  )
  SELECT to_json(patient_details)
  FROM patient_details
  ORDER BY appointment_count DESC;
END;
$$;

-- Create function to get payment summary for a user (doctor or patient)
CREATE OR REPLACE FUNCTION get_payment_summary(user_id UUID, user_role TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  role_field TEXT;
  payment_field TEXT;
BEGIN
  -- Set the field names based on the user role
  IF user_role = 'doctor' THEN
    role_field := 'doctor_id';
    payment_field := 'total_revenue';
  ELSE
    role_field := 'patient_id';
    payment_field := 'total_spent';
  END IF;

  -- Build query dynamically
  EXECUTE format('
    WITH paid_count AS (
      SELECT COUNT(*) as count
      FROM payment_details pd
      JOIN appointments a ON pd.appointment_id = a.id
      WHERE a.%I = $1 AND pd.payment_status = ''successful''
    ),
    pending_count AS (
      SELECT COUNT(*) as count
      FROM payment_details pd
      JOIN appointments a ON pd.appointment_id = a.id
      WHERE a.%I = $1 AND pd.payment_status = ''pending''
    ),
    total_amount AS (
      SELECT COALESCE(SUM(amount), 0) as sum
      FROM payment_details pd
      JOIN appointments a ON pd.appointment_id = a.id
      WHERE a.%I = $1 AND pd.payment_status = ''successful''
    ),
    recent_payments AS (
      SELECT 
        pd.id,
        pd.amount,
        pd.payment_status,
        pd.created_at as payment_date,
        jsonb_build_object(
          ''id'', a.id,
          ''date'', a.date,
          ''time_slot'', a.time_slot
        ) as appointment
      FROM payment_details pd
      JOIN appointments a ON pd.appointment_id = a.id
      WHERE a.%I = $1
      ORDER BY pd.created_at DESC
      LIMIT 5
    )
    SELECT 
      jsonb_build_object(
        ''%s'', (SELECT sum FROM total_amount),
        ''paid_count'', (SELECT count FROM paid_count),
        ''pending_count'', (SELECT count FROM pending_count),
        ''recent_payments'', (
          SELECT COALESCE(
            jsonb_agg(
              jsonb_build_object(
                ''id'', rp.id,
                ''amount'', rp.amount,
                ''status'', rp.payment_status,
                ''payment_date'', rp.payment_date,
                ''appointment'', rp.appointment
              )
            ), 
            ''[]''::jsonb
          )
          FROM recent_payments rp
        )
      )
  ', role_field, role_field, role_field, role_field, payment_field) INTO result USING user_id;

  RETURN result;
END;
$$; 