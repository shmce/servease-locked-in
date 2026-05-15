# ServEase Database Schema Documentation

This directory contains the database schema and migration files for the ServEase service marketplace application.

## Database Tables

### 1. `provider_profiles`
Stores service worker/provider profile and application information.

#### Key Fields:
- **Personal Information**: `full_name`, `email`, `contact_number`
- **Service Profile**: 
  - `primary_category`: The main service category
  - `experience_level`: Integer (0-4) representing experience range
    - `0`: Less than 1 year
    - `1`: 1–2 years
    - `2`: 3–5 years
    - `3`: 6–10 years
    - `4`: 10+ years
- **Work Zone Location**: 
  - `street_address`, `city`, `province`, `zip_code`
  - `max_service_radius_km`: Float (5.0 - 50.0) - Maximum distance provider will travel
- **Documents**: `valid_id_url`, `selfie_url`, `proof_of_skills_url`
- **Verification**: `email_verified`, `email_verification_code`
- **Application Status**: `pending`, `approved`, or `rejected`

### 2. `app_policies`
Stores different versions of Terms & Conditions and Privacy Policy.

#### Key Fields:
- `policy_type`: Either `terms_and_conditions` or `privacy_policy`
- `version`: Version string (e.g., "1.0", "1.1", "2.0")
- `title`: Display title of the policy
- `content`: The actual policy text (can be HTML)
- `effective_date`: When this version becomes effective
- `is_active`: Only one version per policy type can be active at a time

#### Features:
- Version control for legal documents
- Only one active version per policy type
- Track when policies become effective
- Store policy content as HTML for rich formatting

### 3. `user_policy_acceptances`
Tracks which users have accepted which policy versions.

#### Key Fields:
- `user_id`: Reference to the user who accepted
- `policy_id`: Reference to the specific policy version
- `policy_type`: Type of policy accepted
- `policy_version`: Version of policy accepted
- `accepted_at`: Timestamp of acceptance
- `ip_address`: IP address of user at time of acceptance
- `user_agent`: Browser/device information

#### Features:
- Legal compliance tracking
- Audit trail for policy acceptances
- Prevents duplicate acceptances
- Tracks IP and user agent for legal purposes

## Helper Views

### `active_policies`
Returns only the currently active policies for each policy type.

### `user_policy_status`
Shows whether users have accepted the current active policy versions. This view is useful for:
- Checking if a user needs to accept updated policies
- Dashboard showing policy compliance status
- Forcing users to accept new policy versions before accessing features

## Experience Level Mapping

Frontend to Database mapping for the `experience_level` field:

```javascript
const experienceLevelMap = {
  "Less than 1 year": 0,
  "1–2 years": 1,
  "3–5 years": 2,
  "6–10 years": 3,
  "10+ years": 4
};
```

## Service Radius

The `max_service_radius_km` field:
- Type: Float
- Range: 5.0 to 50.0 km
- Default: 10.0 km
- Step: 5 km increments recommended

## Security (Row Level Security)

All tables have RLS enabled:

1. **provider_profiles**: Users can only view/edit their own profiles
2. **app_policies**: Public read access to active policies; admin-only write access
3. **user_policy_acceptances**: Users can only view/insert their own acceptances

## Usage Examples

### Storing Provider Registration Data

When a user completes the 5-step registration flow:

```javascript
// Step 1 data
const step1 = {
  full_name: "Juan Dela Cruz",
  email: "juan@example.com",
  contact_number: "+639123456789",
  password: "hashed_password"
};

// Step 2 data
const step2 = {
  primary_category: "Home Maintenance & Repair",
  experience_level: 2 // Maps to "3–5 years"
};

// Step 3 data
const step3 = {
  street_address: "123 Main Street",
  city: "Quezon City",
  province: "Metro Manila",
  zip_code: "1100",
  max_service_radius_km: 15.0
};

// Step 4 data (document URLs after upload)
const step4 = {
  valid_id_url: "https://storage.../valid_id.jpg",
  selfie_url: "https://storage.../selfie.jpg",
  proof_of_skills_url: "https://storage.../certificate.pdf"
};

// Step 5 data
const step5 = {
  email_verified: true,
  email_verification_code: null
};

// Insert combined data
await supabase.from('provider_profiles').insert({
  ...step1,
  ...step2,
  ...step3,
  ...step4,
  ...step5,
  application_status: 'pending'
});
```

### Checking Policy Acceptance

```javascript
// Get active policies
const { data: activePolicies } = await supabase
  .from('active_policies')
  .select('*');

// Check if user has accepted current policies
const { data: userStatus } = await supabase
  .from('user_policy_status')
  .eq('user_id', userId)
  .eq('is_current_version_accepted', false);

// If userStatus has records, user needs to accept updated policies
if (userStatus.length > 0) {
  // Show policy acceptance modal
}
```

### Recording Policy Acceptance

```javascript
// When user accepts a policy
await supabase.from('user_policy_acceptances').insert({
  user_id: userId,
  policy_id: policyId,
  policy_type: 'terms_and_conditions',
  policy_version: '1.0',
  ip_address: userIpAddress,
  user_agent: navigator.userAgent
});
```

## Migration Instructions

### For Supabase:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `schema.sql`
4. Run the SQL script
5. Verify tables are created in the Table Editor

### For Local Development:

```bash
# If using Supabase CLI
supabase db reset
supabase db push

# Or run the schema file directly
psql -U postgres -d servease -f database/schema.sql
```

## Notes

- All timestamps use UTC timezone
- UUIDs are generated using `gen_random_uuid()`
- The schema includes triggers to automatically update `updated_at` fields
- Sample policies are inserted for development/testing purposes
- Remember to update policy versions and set old ones to `is_active = FALSE` when releasing updates
