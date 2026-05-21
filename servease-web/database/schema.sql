-- ServEase Database Schema
-- This file contains the database schema for the ServEase service marketplace application

-- ============================================
-- PROVIDER PROFILES TABLE
-- ============================================
-- Stores service worker/provider profile information
CREATE TABLE IF NOT EXISTS provider_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Personal Information
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  contact_number VARCHAR(15) NOT NULL, -- Format: +639123456789
  
  -- Service Profile
  primary_category VARCHAR(100) NOT NULL,
  experience_level INT NOT NULL CHECK (experience_level >= 0 AND experience_level <= 5), 
  -- 0: Less than 1 year, 1: 1-2 years, 2: 3-5 years, 3: 6-10 years, 4: 10+ years
  
  -- Work Zone Location
  street_address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  province VARCHAR(100) NOT NULL,
  zip_code VARCHAR(4) NOT NULL,
  max_service_radius_km FLOAT NOT NULL DEFAULT 10.0 CHECK (max_service_radius_km >= 5 AND max_service_radius_km <= 50),
  
  -- Document Upload (KYC)
  valid_id_url TEXT, -- URL to uploaded valid ID
  selfie_url TEXT, -- URL to uploaded selfie photo
  proof_of_skills_url TEXT, -- URL to uploaded certificate/portfolio
  
  -- Verification Status
  email_verified BOOLEAN DEFAULT FALSE,
  email_verification_code VARCHAR(6),
  email_verification_expires_at TIMESTAMP,
  
  -- Application Status
  application_status VARCHAR(20) DEFAULT 'pending' CHECK (application_status IN ('pending', 'approved', 'rejected')),
  reviewed_at TIMESTAMP,
  reviewed_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_provider_profiles_user_id ON provider_profiles(user_id);
CREATE INDEX idx_provider_profiles_email ON provider_profiles(email);
CREATE INDEX idx_provider_profiles_application_status ON provider_profiles(application_status);
CREATE INDEX idx_provider_profiles_category ON provider_profiles(primary_category);

-- ============================================
-- APP POLICIES TABLE
-- ============================================
-- Stores different versions of Terms & Conditions and Privacy Policy
CREATE TABLE IF NOT EXISTS app_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_type VARCHAR(50) NOT NULL CHECK (policy_type IN ('terms_and_conditions', 'privacy_policy')),
  version VARCHAR(20) NOT NULL, -- e.g., "1.0", "1.1", "2.0"
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL, -- The actual policy text/HTML
  effective_date DATE NOT NULL, -- When this version becomes effective
  is_active BOOLEAN DEFAULT TRUE, -- Only one active version per policy_type
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Unique constraint: only one active version per policy type
  CONSTRAINT unique_active_policy UNIQUE (policy_type, is_active) WHERE is_active = TRUE
);

-- Index for faster lookups
CREATE INDEX idx_app_policies_type ON app_policies(policy_type);
CREATE INDEX idx_app_policies_active ON app_policies(policy_type, is_active);
CREATE INDEX idx_app_policies_effective_date ON app_policies(effective_date);

-- ============================================
-- USER POLICY ACCEPTANCES TABLE
-- ============================================
-- Tracks which users have accepted which policy versions
CREATE TABLE IF NOT EXISTS user_policy_acceptances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  policy_id UUID NOT NULL REFERENCES app_policies(id) ON DELETE CASCADE,
  policy_type VARCHAR(50) NOT NULL CHECK (policy_type IN ('terms_and_conditions', 'privacy_policy')),
  policy_version VARCHAR(20) NOT NULL,
  
  -- Acceptance details
  accepted_at TIMESTAMP DEFAULT NOW(),
  ip_address VARCHAR(45), -- IPv4 or IPv6
  user_agent TEXT, -- Browser/device info
  
  -- Constraint: One acceptance per user per policy version
  CONSTRAINT unique_user_policy_acceptance UNIQUE (user_id, policy_id)
);

-- Index for faster lookups
CREATE INDEX idx_user_policy_acceptances_user_id ON user_policy_acceptances(user_id);
CREATE INDEX idx_user_policy_acceptances_policy_id ON user_policy_acceptances(policy_id);
CREATE INDEX idx_user_policy_acceptances_user_policy_type ON user_policy_acceptances(user_id, policy_type);

-- ============================================
-- HELPER VIEWS
-- ============================================

-- View to get the latest active policies
CREATE OR REPLACE VIEW active_policies AS
SELECT 
  id,
  policy_type,
  version,
  title,
  content,
  effective_date,
  created_at
FROM app_policies
WHERE is_active = TRUE
ORDER BY policy_type;

-- View to check user's policy acceptance status
CREATE OR REPLACE VIEW user_policy_status AS
SELECT 
  u.id as user_id,
  u.email,
  ap.policy_type,
  ap.version as current_version,
  upa.policy_version as accepted_version,
  upa.accepted_at,
  CASE 
    WHEN upa.policy_version = ap.version THEN TRUE
    ELSE FALSE
  END as is_current_version_accepted
FROM auth.users u
CROSS JOIN (SELECT DISTINCT policy_type, version FROM app_policies WHERE is_active = TRUE) ap
LEFT JOIN user_policy_acceptances upa 
  ON u.id = upa.user_id 
  AND ap.policy_type = upa.policy_type;

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- Enable RLS on all tables
ALTER TABLE provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_policy_acceptances ENABLE ROW LEVEL SECURITY;

-- Provider Profiles RLS Policies
-- Users can only view and update their own provider profile
CREATE POLICY "Users can view own provider profile"
  ON provider_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own provider profile"
  ON provider_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own provider profile"
  ON provider_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- App Policies RLS Policies
-- Everyone can read active policies (public)
CREATE POLICY "Anyone can read active policies"
  ON app_policies FOR SELECT
  USING (is_active = TRUE);

-- Only admins can insert/update policies (implement role-based logic)
CREATE POLICY "Admins can manage policies"
  ON app_policies FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- User Policy Acceptances RLS Policies
-- Users can view their own acceptances
CREATE POLICY "Users can view own policy acceptances"
  ON user_policy_acceptances FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own acceptances
CREATE POLICY "Users can insert own policy acceptances"
  ON user_policy_acceptances FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_provider_profiles_updated_at
  BEFORE UPDATE ON provider_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_policies_updated_at
  BEFORE UPDATE ON app_policies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA (for development/testing)
-- ============================================

-- Insert sample active policies
INSERT INTO app_policies (policy_type, version, title, content, effective_date, is_active)
VALUES 
  (
    'terms_and_conditions',
    '1.0',
    'ServEase Terms and Conditions',
    '<h1>Terms and Conditions</h1><p>Welcome to ServEase. By using our service marketplace, you agree to these terms...</p>',
    '2024-01-01',
    TRUE
  ),
  (
    'privacy_policy',
    '1.0',
    'ServEase Privacy Policy',
    '<h1>Privacy Policy</h1><p>Your privacy is important to us. This policy explains how we collect and use your data...</p>',
    '2024-01-01',
    TRUE
  );

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE provider_profiles IS 'Stores service worker/provider profile and application information';
COMMENT ON COLUMN provider_profiles.experience_level IS '0: Less than 1 year, 1: 1-2 years, 2: 3-5 years, 3: 6-10 years, 4: 10+ years';
COMMENT ON COLUMN provider_profiles.max_service_radius_km IS 'Maximum distance (in km) the provider is willing to travel for services';
COMMENT ON COLUMN provider_profiles.application_status IS 'Provider application status: pending, approved, or rejected';

COMMENT ON TABLE app_policies IS 'Stores different versions of Terms & Conditions and Privacy Policy';
COMMENT ON COLUMN app_policies.is_active IS 'Only one version per policy_type can be active at a time';

COMMENT ON TABLE user_policy_acceptances IS 'Tracks which users have accepted which policy versions';
COMMENT ON VIEW user_policy_status IS 'Shows whether users have accepted the current active policy versions';
