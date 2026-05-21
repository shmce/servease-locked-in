-- ============================================
-- EXAMPLE QUERIES FOR SERVEASE DATABASE
-- ============================================

-- ============================================
-- PROVIDER PROFILE QUERIES
-- ============================================

-- Get all pending provider applications
SELECT 
  id,
  full_name,
  email,
  contact_number,
  primary_category,
  CASE experience_level
    WHEN 0 THEN 'Less than 1 year'
    WHEN 1 THEN '1–2 years'
    WHEN 2 THEN '3–5 years'
    WHEN 3 THEN '6–10 years'
    WHEN 4 THEN '10+ years'
  END as experience,
  city,
  province,
  max_service_radius_km,
  created_at
FROM provider_profiles
WHERE application_status = 'pending'
ORDER BY created_at DESC;

-- Get approved providers by category
SELECT 
  primary_category,
  COUNT(*) as provider_count,
  AVG(max_service_radius_km) as avg_service_radius
FROM provider_profiles
WHERE application_status = 'approved'
GROUP BY primary_category
ORDER BY provider_count DESC;

-- Find providers in a specific area
SELECT 
  full_name,
  primary_category,
  city,
  province,
  max_service_radius_km,
  CASE experience_level
    WHEN 0 THEN 'Less than 1 year'
    WHEN 1 THEN '1–2 years'
    WHEN 2 THEN '3–5 years'
    WHEN 3 THEN '6–10 years'
    WHEN 4 THEN '10+ years'
  END as experience
FROM provider_profiles
WHERE 
  application_status = 'approved'
  AND city = 'Quezon City'
  AND province = 'Metro Manila'
ORDER BY experience_level DESC;

-- Get provider profile with all details
SELECT 
  pp.*,
  CASE experience_level
    WHEN 0 THEN 'Less than 1 year'
    WHEN 1 THEN '1–2 years'
    WHEN 2 THEN '3–5 years'
    WHEN 3 THEN '6–10 years'
    WHEN 4 THEN '10+ years'
  END as experience_text
FROM provider_profiles pp
WHERE user_id = 'USER_UUID_HERE';

-- Update provider application status
UPDATE provider_profiles
SET 
  application_status = 'approved',
  reviewed_at = NOW(),
  reviewed_by = 'ADMIN_UUID_HERE'
WHERE id = 'PROVIDER_PROFILE_UUID_HERE';

-- Reject provider application with reason
UPDATE provider_profiles
SET 
  application_status = 'rejected',
  reviewed_at = NOW(),
  reviewed_by = 'ADMIN_UUID_HERE',
  rejection_reason = 'Incomplete documentation'
WHERE id = 'PROVIDER_PROFILE_UUID_HERE';

-- Get providers by experience level
SELECT 
  CASE experience_level
    WHEN 0 THEN 'Less than 1 year'
    WHEN 1 THEN '1–2 years'
    WHEN 2 THEN '3–5 years'
    WHEN 3 THEN '6–10 years'
    WHEN 4 THEN '10+ years'
  END as experience_range,
  COUNT(*) as count
FROM provider_profiles
WHERE application_status = 'approved'
GROUP BY experience_level
ORDER BY experience_level;

-- Get providers with largest service radius
SELECT 
  full_name,
  primary_category,
  city,
  max_service_radius_km,
  CASE experience_level
    WHEN 0 THEN 'Less than 1 year'
    WHEN 1 THEN '1–2 years'
    WHEN 2 THEN '3–5 years'
    WHEN 3 THEN '6–10 years'
    WHEN 4 THEN '10+ years'
  END as experience
FROM provider_profiles
WHERE application_status = 'approved'
ORDER BY max_service_radius_km DESC
LIMIT 10;

-- ============================================
-- POLICY QUERIES
-- ============================================

-- Get all active policies
SELECT * FROM active_policies;

-- Get specific active policy
SELECT * 
FROM app_policies
WHERE policy_type = 'terms_and_conditions'
  AND is_active = TRUE;

-- Get policy version history
SELECT 
  policy_type,
  version,
  effective_date,
  is_active,
  created_at
FROM app_policies
ORDER BY policy_type, version DESC;

-- Insert new policy version
INSERT INTO app_policies (
  policy_type,
  version,
  title,
  content,
  effective_date,
  is_active,
  created_by
) VALUES (
  'terms_and_conditions',
  '2.0',
  'ServEase Terms and Conditions v2.0',
  '<h1>Updated Terms and Conditions</h1><p>Content here...</p>',
  '2024-06-01',
  FALSE, -- Set to FALSE initially, then update when ready to activate
  'ADMIN_UUID_HERE'
);

-- Activate a new policy version (deactivates old one)
BEGIN;
  -- Deactivate old version
  UPDATE app_policies
  SET is_active = FALSE
  WHERE policy_type = 'terms_and_conditions'
    AND is_active = TRUE;
  
  -- Activate new version
  UPDATE app_policies
  SET is_active = TRUE
  WHERE id = 'NEW_POLICY_UUID_HERE';
COMMIT;

-- ============================================
-- USER POLICY ACCEPTANCE QUERIES
-- ============================================

-- Check if user has accepted current policies
SELECT 
  ups.policy_type,
  ups.current_version,
  ups.accepted_version,
  ups.is_current_version_accepted,
  ups.accepted_at
FROM user_policy_status ups
WHERE 
  ups.user_id = 'USER_UUID_HERE'
  AND ups.is_current_version_accepted = FALSE;

-- Record user policy acceptance
INSERT INTO user_policy_acceptances (
  user_id,
  policy_id,
  policy_type,
  policy_version,
  ip_address,
  user_agent
) VALUES (
  'USER_UUID_HERE',
  'POLICY_UUID_HERE',
  'terms_and_conditions',
  '1.0',
  '192.168.1.1',
  'Mozilla/5.0...'
);

-- Get all users who haven't accepted the latest policies
SELECT DISTINCT
  u.id,
  u.email,
  ups.policy_type,
  ups.current_version,
  ups.accepted_version
FROM auth.users u
CROSS JOIN active_policies ap
LEFT JOIN user_policy_acceptances upa 
  ON u.id = upa.user_id 
  AND ap.id = upa.policy_id
LEFT JOIN user_policy_status ups
  ON u.id = ups.user_id
  AND ap.policy_type = ups.policy_type
WHERE 
  ups.is_current_version_accepted = FALSE
  OR ups.is_current_version_accepted IS NULL;

-- Get acceptance history for a user
SELECT 
  upa.policy_type,
  upa.policy_version,
  ap.title,
  upa.accepted_at,
  upa.ip_address
FROM user_policy_acceptances upa
JOIN app_policies ap ON upa.policy_id = ap.id
WHERE upa.user_id = 'USER_UUID_HERE'
ORDER BY upa.accepted_at DESC;

-- Get policy acceptance statistics
SELECT 
  ap.policy_type,
  ap.version,
  COUNT(DISTINCT upa.user_id) as users_accepted,
  (
    SELECT COUNT(*) 
    FROM auth.users
  ) as total_users,
  ROUND(
    (COUNT(DISTINCT upa.user_id)::FLOAT / (SELECT COUNT(*) FROM auth.users)::FLOAT) * 100,
    2
  ) as acceptance_percentage
FROM app_policies ap
LEFT JOIN user_policy_acceptances upa ON ap.id = upa.policy_id
WHERE ap.is_active = TRUE
GROUP BY ap.id, ap.policy_type, ap.version;

-- ============================================
-- COMBINED QUERIES
-- ============================================

-- Get provider profile with policy acceptance status
SELECT 
  pp.id,
  pp.full_name,
  pp.email,
  pp.primary_category,
  pp.application_status,
  pp.created_at,
  -- Check Terms & Conditions
  (
    SELECT is_current_version_accepted
    FROM user_policy_status
    WHERE user_id = pp.user_id
      AND policy_type = 'terms_and_conditions'
  ) as tc_accepted,
  -- Check Privacy Policy
  (
    SELECT is_current_version_accepted
    FROM user_policy_status
    WHERE user_id = pp.user_id
      AND policy_type = 'privacy_policy'
  ) as pp_accepted
FROM provider_profiles pp
WHERE pp.user_id = 'USER_UUID_HERE';

-- Get dashboard statistics
SELECT 
  (SELECT COUNT(*) FROM provider_profiles WHERE application_status = 'pending') as pending_applications,
  (SELECT COUNT(*) FROM provider_profiles WHERE application_status = 'approved') as approved_providers,
  (SELECT COUNT(*) FROM provider_profiles WHERE application_status = 'rejected') as rejected_applications,
  (SELECT COUNT(*) FROM provider_profiles WHERE created_at >= NOW() - INTERVAL '7 days') as new_applications_this_week,
  (SELECT COUNT(DISTINCT user_id) FROM user_policy_acceptances WHERE accepted_at >= NOW() - INTERVAL '7 days') as policy_acceptances_this_week;

-- Get providers who need to accept updated policies
SELECT 
  pp.id,
  pp.full_name,
  pp.email,
  pp.application_status,
  ups.policy_type,
  ups.current_version,
  ups.accepted_version
FROM provider_profiles pp
JOIN user_policy_status ups ON pp.user_id = ups.user_id
WHERE 
  pp.application_status = 'approved'
  AND ups.is_current_version_accepted = FALSE;

-- ============================================
-- MAINTENANCE QUERIES
-- ============================================

-- Delete old policy versions (keep only last 3 versions per type)
WITH ranked_policies AS (
  SELECT 
    id,
    policy_type,
    version,
    ROW_NUMBER() OVER (PARTITION BY policy_type ORDER BY created_at DESC) as rn
  FROM app_policies
  WHERE is_active = FALSE
)
DELETE FROM app_policies
WHERE id IN (
  SELECT id FROM ranked_policies WHERE rn > 3
);

-- Clean up expired verification codes
UPDATE provider_profiles
SET 
  email_verification_code = NULL,
  email_verification_expires_at = NULL
WHERE 
  email_verification_expires_at < NOW()
  AND email_verified = FALSE;

-- Archive old rejected applications (older than 6 months)
-- Note: Create an archive table first
CREATE TABLE IF NOT EXISTS provider_profiles_archive (LIKE provider_profiles INCLUDING ALL);

INSERT INTO provider_profiles_archive
SELECT * FROM provider_profiles
WHERE 
  application_status = 'rejected'
  AND reviewed_at < NOW() - INTERVAL '6 months';

DELETE FROM provider_profiles
WHERE 
  application_status = 'rejected'
  AND reviewed_at < NOW() - INTERVAL '6 months';
