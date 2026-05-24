# ServEase Data Models - Sprint 4 (Final)

Converted to Markdown from the uploaded PDF and supplemented with AI review notes.

## AI Review Notes

The document is strong because each business question connects a persona, business purpose, schema/table mapping, derivation formula, SQL query, and result interpretation. That makes it useful not just as a data-model reference, but also as a dashboard planning document.

Key AI observations:

- The strongest operational insight is the concentration of customer demand in Makati and Quezon City, which supports targeted marketing and provider recruitment instead of broad spending.
- Several values are clearly seed-data artifacts, especially monthly registrations, provider/customer ratios, payment completion status, and one-month payout trends. These should be labeled clearly in dashboards so the team does not mistake seeded test behavior for real launch behavior.
- The provider catalog has a major supply gap: Plumbing has assigned providers, while Carpentry, Cleaning, and Electrical show zero providers in the converted notes. That is a high-priority recruitment issue before launch.
- Legal/compliance tracking is important: the notes say 24 of 25 active customers have not accepted the latest app policies, so the mandatory in-app acceptance flow should be treated as a launch blocker.
- Support and dispute metrics look below the suggested thresholds in the seed data. The dispute resolution rate is listed as 50%, and support-ticket resolution is listed as 46.67%, so the admin dashboard should make unresolved items visible daily.
- Messaging health looks promising in the seed data: the average response time is listed as 3 minutes, which is well below the document's concern threshold.
- For production readiness, each SQL metric should have an owner, refresh frequency, alert threshold, and QA test case. This would turn the data model into an operational monitoring plan.

Suggested improvements before final submission or production use:

- Add a short “Production vs. Seed Data” note beside every interpretation that comes from seeded data.
- Add expected output columns for each SQL query so reviewers know what the result table should look like.
- Add dashboard tile names, refresh cadence, and alert thresholds for each business question.
- Add indexes or performance notes for commonly filtered/joined fields such as `role`, `status`, `created_at`, `provider_id`, `customer_id`, `booking_id`, and `policy_id`.
- Keep `NULLIF` and null-handling consistent across all rate calculations to avoid divide-by-zero errors in production.

---

## Converted Document

| Field | Value |
| --- | --- |
| Sprint | Sprint 4 Descriptive Analytics |
| Owner | BA Chapter Lead - Althea Garcia |
| Chapter | Backend Chapter & Data Model |
| Database | Supabase - Main DB |

**Note:** Do not edit anything without permission.

## Schema: identity_and_user

**Tables:** users, customer_profiles, user_addresses, user_policy_acceptance, app_policies

### N-1. Which city or province has the highest number of registered customers?

**Persona:** Platform Admin  
**Category:** Customer Behavior

**Purpose:** To direct local marketing spend and target provider recruitment to high-demand areas.

**Why It's Needed:** We risk wasting advertising budgets in areas with low demand, or missing opportunities to expand in our most popular areas.

#### Column Mapping per Business Question

| Schema.Table | Column(s) | Description | Availability | Derivation Formula |
| --- | --- | --- | --- | --- |
| identity_and_user.user_addresses | city, province | Location data to find where the<br>highest number of customers<br>are registered. Grouped by city<br>and province to count<br>customers per location. | Direct | COUNT(user_id)<br>GROUP BY city,<br>province |

#### SQL Query & Result

##### SQL Query

```sql
SELECT
city,
province,
COUNT(user_id) AS total_customers
FROM identity_and_user.user_addresses
GROUP BY city, province
ORDER BY total_customers DESC;
```

##### Result / Interpretation

Interpretation (verified April 11, 2026): Makati leads with 12 registered customer addresses, followed by Quezon City (10). All top locations are in Metro Manila. One customer from Rizal (Cainta). Target primary marketing and provider recruitment in Makati and Quezon City first.

### N-2. How many new customers registered this month?

**Persona:** Platform Admin / Marketing  
**Category:** Traffic Monitoring

**Purpose:** To adjust marketing strategy or increase ad spend if monthly registrations fall below target.

**Why It's Needed:** We won't know if our marketing campaigns are failing to attract new users until revenue drops. Early warning via monthly tracking prevents this.

#### Column Mapping per Business Question

| Schema.Table | Column(s) | Description | Availability | Derivation Formula |
| --- | --- | --- | --- | --- |
| identity_and_user.users | created_at, role | Filters new customer<br>registrations by the current<br>month. Role filter ensures only<br>customers are counted. | Derived | DATE_TRUNC('month',<br>created_at)<br>= DATE_TRUNC('month',<br>CURRENT_DATE)<br>AND role = 'customer' |

#### SQL Query & Result

##### SQL Query

```sql
SELECT
COUNT(id) AS new_customers_this_month
FROM identity_and_user.users
WHERE role = 'customer'
AND DATE_TRUNC('month', created_at)
= DATE_TRUNC('month', CURRENT_DATE);
```

##### Result / Interpretation

Interpretation: 0 new customers registered in April 2026 (current month). All 31 customers registered in March 2026 during initial seeding. Expected for seed data; production will show monthly inflow after launch.

### N-3. What is the breakdown of customer account statuses?

**Persona:** Platform Admin  
**Category:** Issues

**Purpose:** To trigger admin troubleshooting campaigns to help stuck 'pending' accounts complete setup, and monitor suspended accounts.

**Why It's Needed:** We might lose customers who cannot get approved, or fail to detect fraudulent suspended accounts before they cause harm to the platform.

#### Column Mapping per Business Question

| Schema.Table | Column(s) | Description | Availability | Derivation Formula |
| --- | --- | --- | --- | --- |
| identity_and_user.users | status, role | Current standing of the user<br>account (active, pending,<br>suspended, rejected). Role<br>filter scopes results to<br>customers only. | Direct | COUNT(id) GROUP BY<br>status<br>WHERE role =<br>'customer' |

#### SQL Query & Result

##### SQL Query

```sql
SELECT
status,
COUNT(id) AS total_customers
FROM identity_and_user.users
WHERE role = 'customer'
GROUP BY status
ORDER BY total_customers DESC;
```

##### Result / Interpretation

Interpretation: 25 active customers (80.6%), 6 pending (19.4%). No suspended or rejected accounts. Pending accounts need admin follow-up to complete setup 6 potential customers at risk of dropping off.

### N-4. What is the age demographic breakdown of our registered customers?

**Persona:** Platform Admin / Marketing  
**Category:** Customer Behavior

**Purpose:** To select the correct social media platforms and messaging style for targeted ad campaigns.

**Why It's Needed:** We will miss opportunities to attract certain age groups like teenagers or seniors if we don't know our current demographic mix.

#### Column Mapping per Business Question

| Schema.Table | Column(s) | Description | Availability | Derivation Formula |
| --- | --- | --- | --- | --- |
| identity_and_user.users | date_of_birth | Used to calculate the<br>customer's current age.<br>Nullable, must filter WHERE<br>date_of_birth IS NOT NULL. | Derived | EXTRACT(YEAR FROM age(<br>CURRENT_DATE,<br>date_of_birth)) |

#### SQL Query & Result

##### SQL Query

```sql
SELECT
EXTRACT(YEAR FROM age(
CURRENT_DATE, date_of_birth))
AS age,
COUNT(id) AS total_customers
FROM identity_and_user.users
WHERE role = 'customer'
AND date_of_birth IS NOT NULL
GROUP BY age
ORDER BY age ASC;
```

##### Result / Interpretation

Interpretation: Customer ages range 21–58. Peak concentration is 29 and 45. Platform skews toward working adults (30–50). Recommend targeting platforms used by 25–50 age group.

### N-5. Which customers have not yet accepted the latest app policies?

**Persona:** Platform Admin / Legal  
**Category:** Issues

**Purpose:** To trigger a mandatory in-app pop-up forcing these specific users to accept the terms before their next booking.

**Why It's Needed:** If we don't know who hasn't accepted, the business faces legal compliance risks from users operating under outdated terms and conditions.

#### Column Mapping per Business Question

| Schema.Table | Column(s) | Description | Availability | Derivation Formula |
| --- | --- | --- | --- | --- |
| identity_and_user.user_policy_acceptance<br>& identity_and_user.app_policies | user_id, policy_id,<br>is_active | Compares active users against<br>app_policies to find those who<br>haven't accepted the currently<br>active policy. | Derived | Check for missing<br>user_id in<br>user_policy_acceptance<br>for policy_id where<br>is_active = true |

#### SQL Query & Result

##### SQL Query

```sql
SELECT
u.id AS user_id,
u.full_name,
u.email,
ap.policy_type
FROM identity_and_user.users u
CROSS JOIN identity_and_user.app_policies ap
LEFT JOIN
identity_and_user.user_policy_acceptance upa
ON u.id = upa.user_id
AND ap.policy_id = upa.policy_id
WHERE u.role = 'customer'
AND u.status = 'active'
AND ap.is_active = true
AND upa.acceptance_id IS NULL;
```

##### Result / Interpretation

Interpretation: 24 of 25 active customers have NOT accepted the latest T&C. Only 1 accepted (seed data). Admin must trigger mandatory in-app acceptance flow before next booking for all 24.

### N-6. How long has a customer been using the app?

**Persona:** Platform Admin / Marketing  
**Category:** Customer Behavior

**Purpose:** To group users into old and new cohorts to identify who has been loyal to the platform.

**Why It's Needed:** Without knowing account tenure, we cannot measure customer loyalty or identify if long-term users are slowly abandoning the platform, a key churn signal.

#### Column Mapping per Business Question

| Schema.Table | Column(s) | Description | Availability | Derivation Formula |
| --- | --- | --- | --- | --- |
| identity_and_user.users | created_at | Timestamp of account<br>creation. Used to calculate<br>how many days the account<br>has been open. | Derived | DATE_PART('day', NOW()<br>-<br>created_at)::int<br>AS tenure_in_days |

#### SQL Query & Result

##### SQL Query

```sql
SELECT
id AS user_id,
full_name,
created_at,
DATE_PART('day', NOW() - created_at)::int
AS tenure_in_days
FROM identity_and_user.users
WHERE role = 'customer'
AND status = 'active'
ORDER BY tenure_in_days DESC;
```

##### Result / Interpretation

All 25 active customers have 35-day tenure (verified April 11, 2026). All were seeded on 2026-03-06. In production, tenure spread will grow over time enabling cohort-based analysis.

### N-10. How many provider accounts are currently suspended?

**Persona:** Platform Admin  
**Category:** Issues

**Purpose:** To monitor platform trust and safety by tracking the current count of suspended provider accounts as a daily safety KPI.

**Why It's Needed:** A rising suspension count signals systemic quality or compliance issues within the provider pool. Without this metric, the admin team cannot set enforcement thresholds, assess whether suspension policies are effective, or detect if specific service categories are producing disproportionate violations.

#### Column Mapping per Business Question

| Schema.Table | Column(s) | Description | Availability | Derivation Formula |
| --- | --- | --- | --- | --- |
| identity_and_user.users | status, role | Identifies suspended provider<br>accounts where role =<br>'provider' and status =<br>'suspended'. | Direct | COUNT(id) WHERE<br>role='provider'<br>AND status='suspended' |

#### SQL Query & Result

##### SQL Query

```sql
SELECT
COUNT(id) AS suspended_providers
FROM identity_and_user.users
WHERE role = 'provider'
AND status = 'suspended';
```

##### Result / Interpretation

Interpretation: No provider accounts are currently suspended. This is expected for seed data. In production, this count should be monitored daily as a trust and safety metric. Flag immediately if count exceeds 3% of total active providers.

### N-13. What is the monthly trend of new customer registrations?

**Persona:** Platform Admin / Marketing  
**Category:** Business Management

**Purpose:** To see if long-term marketing is working and adjust budgets for busy or slow months.

**Why It's Needed:** Without this, we might waste money running ads at the wrong time of year and miss seasonal demand patterns.

#### Column Mapping per Business Question

| Schema.Table | Column(s) | Description | Availability | Derivation Formula |
| --- | --- | --- | --- | --- |
| identity_and_user.users | created_at, role | Used to group customer<br>registrations by the specific<br>month and year their account<br>was created. | Derived | DATE_TRUNC('month',<br>created_at)<br>WHERE role =<br>'customer' |

#### SQL Query & Result

##### SQL Query

```sql
SELECT
TO_CHAR(created_at, 'YYYY-MM')
AS registration_month,
COUNT(id) AS total_new_customers
FROM identity_and_user.users
WHERE role = 'customer'
GROUP BY TO_CHAR(created_at, 'YYYY-MM')
ORDER BY registration_month ASC;
```

##### Result / Interpretation

Interpretation: All 31 customers registered in March 2026 (seed data). In production, this query will show month-over-month growth trends. Currently only one data point exists.

### N-14. What is the monthly trend of new provider registrations?

**Persona:** Platform Admin / Operations  
**Category:** Business Management

**Purpose:** To predict when we will need more workers and hire them before a busy season starts.

**Why It's Needed:** We might not have enough workers when customer demand suddenly spikes if we don't track provider supply growth trends.

#### Column Mapping per Business Question

| Schema.Table | Column(s) | Description | Availability | Derivation Formula |
| --- | --- | --- | --- | --- |
| identity_and_user.users | created_at, role | Used to group provider<br>registrations by the specific<br>month and year their account<br>was created. | Derived | DATE_TRUNC('month',<br>created_at)<br>WHERE role =<br>'provider' |

#### SQL Query & Result

##### SQL Query

```sql
SELECT
TO_CHAR(created_at, 'YYYY-MM')
AS registration_month,
COUNT(id) AS total_new_providers
FROM identity_and_user.users
WHERE role = 'provider'
GROUP BY TO_CHAR(created_at, 'YYYY-MM')
ORDER BY registration_month ASC;
```

##### Result / Interpretation

Interpretation: All 31 providers registered in March 2026 (seed data). In production, this shows provider supply growth vs. customer demand growth critical for supply-demand balance management.

### N-15: What is the daily active customer count over time?

**Persona:** Platform Admin / Marketing  
**Category:** Customer Behavior

**Purpose:** To track day-by-day how many distinct customers are actively placing bookings, identifying retention trends, peak engagement days, and early warning signs of churn.

**Why It's Needed:** Without this metric, we cannot distinguish between total registered customers and actually active ones. If daily active bookings drop while registrations stay flat, it signals churn customers are signing up but not returning. This is the foundational metric for retention analysis in Sprint 5 predictive models.

#### Column Mapping per Business Question

| Schema.Table | Column(s) | Description | Availability | Derivation Formula |
| --- | --- | --- | --- | --- |
| booking.bookings | customer_id,<br>created_at | Groups bookings by calendar<br>date and counts the number of<br>distinct customers who placed<br>at least one booking on that<br>day. The date dimension is<br>derived from the created_at<br>timestamp. | Derived | COUNT(DISTINCT<br>customer_id)<br>GROUP BY<br>DATE(created_at) |

#### SQL Query & Result

##### SQL Query

```sql
SELECT
DATE(created_at) AS booking_date,
COUNT(DISTINCT customer_id) AS
active_customers,
COUNT(*) AS total_bookings
FROM booking.bookings
GROUP BY DATE(created_at)
ORDER BY booking_date;
```

##### Result / Interpretation

_No textual result was captured in the PDF conversion; the original may show a screenshot or blank result cell._

### N-16 NEW. What is the current ratio of active providers to active customers?

**Persona:** Platform Admin / Operations  
**Category:** Business Management

**Purpose:** Supply-demand balance monitoring determines whether the platform has enough active providers relative to the number of active customers, enabling proactive recruitment or customer acquisition campaigns.

**Why It's Needed:** If the customer-to-provider ratio becomes too high (>8–10), providers get overwhelmed, bookings fail, wait times increase, and customers leave for competitors. An early warning ratio prevents supply-side collapse before it impacts revenue. Conversely, a ratio below 1.0 means excess provider supply providers may not earn enough to stay active on the platform.

#### Column Mapping per Business Question

| Schema.Table | Column(s) | Description | Availability | Derivation Formula |
| --- | --- | --- | --- | --- |
| identity_and_user.users | role, status | Counts active customers and<br>active providers from the<br>unified users table and<br>computes the ratio of<br>customers per provider. | Derived | COUNT(*) FILTER (WHERE<br>role='customer')<br>/ COUNT(*) FILTER<br>(WHERE<br>role='provider')<br>WHERE status='active' |

#### SQL Query & Result

##### SQL Query

```sql
SELECT
COUNT(*) FILTER (WHERE role = 'customer'
AND status = 'active')
AS active_customers,
COUNT(*) FILTER (WHERE role = 'provider'
AND status = 'active')
AS active_providers,
ROUND(
COUNT(*) FILTER (WHERE role='customer'
AND status='active')::numeric /
NULLIF(COUNT(*) FILTER (WHERE
role='provider'
AND status='active'), 0), 2)
AS customers_per_provider
FROM identity_and_user.users;
```

##### Result / Interpretation

Interpretation:

## Schema: provider_catalog

**Tables:** provider_profiles, provider_documents, service_categories, provider_services, location

### N-7. What is the availability of verified providers?

**Persona:** Platform Admin / Operations  
**Category:** Business Management

**Purpose:** To trigger recruitment campaigns or offer surge pricing if the supply of available, verified providers is too low.

**Why It's Needed:** Customers have fewer choices in services if there are no available verified providers. Low supply directly causes booking failure and customer churn.

#### Column Mapping per Business Question

| Schema.Table | Column(s) | Description | Availability | Derivation Formula |
| --- | --- | --- | --- | --- |
| provider_catalog.provider_profiles | verification_status<br>,<br>is_available | Identifies active, ready-to-work<br>providers by cross-referencing<br>verification status and<br>availability flag. | Direct | COUNT(user_id) GROUP<br>BY<br>verification_status,<br>is_available |

#### SQL Query & Result

##### SQL Query

```sql
SELECT
verification_status,
is_available,
COUNT(user_id) AS total_providers
FROM provider_catalog.provider_profiles
GROUP BY verification_status, is_available
ORDER BY verification_status, is_available;
```

##### Result / Interpretation

Interpretation:

### N-8. Which provider KYC documents have been pending for more than 3 days?

**Persona:** Platform Admin  
**Category:** Issues

**Purpose:** To direct the Admin team to prioritize review and approval of delayed documents.

**Why It's Needed:** Providers may abandon the platform before getting approved, reducing overall workforce supply. Delays also expose the platform to compliance risk.

#### Column Mapping per Business Question

| Schema.Table | Column(s) | Description | Availability | Derivation Formula |
| --- | --- | --- | --- | --- |

| provider_catalog.provider_documents | provider_id,<br>document_type,<br>status,<br>uploaded_at | Tracks delays in KYC manual<br>approval. Filters to pending<br>docs and calculates how many<br>days they have been waiting. | Derived | DATE_PART('day', NOW()<br>-<br>uploaded_at)::int<br>WHERE status='pending'<br>AND days > 3 |
| --- | --- | --- | --- | --- |

#### SQL Query & Result

##### SQL Query

```sql
SELECT
provider_id,
document_type,
uploaded_at,
DATE_PART('day', NOW() - uploaded_at)::int
AS days_pending
FROM provider_catalog.provider_documents
WHERE status = 'pending'
AND DATE_PART('day', NOW() - uploaded_at)
> 3
ORDER BY days_pending DESC;
```

##### Result / Interpretation

Interpretation (verified April 11, 2026): 3 providers have KYC pending beyond 3-day SLA. One provider has waited 30 days critical breach requiring immediate admin action. Two providers pending 16 days urgent review. All are government_id type documents.

### N-9. What is the total number of unique services listed in the catalog?

**Persona:** Platform Admin / Operations  
**Category:** Business Management

**Purpose:** To decide whether the business needs to launch new service categories or recruit specialized workers to fill gaps.

**Why It's Needed:** Without knowing our exact service catalog, we might fail to notice missing high-demand services that competitors offer.

#### Column Mapping per Business Question

| Schema.Table | Column(s) | Description | Availability | Derivation Formula |
| --- | --- | --- | --- | --- |
| provider_catalog.service_categories | id, name, is_active | List of the broad, unique<br>service categories offered on<br>the platform. Filtered to active<br>categories only. | Direct | COUNT(id) WHERE<br>is_active = true |

#### SQL Query & Result

##### SQL Query

```sql
SELECT
COUNT(id) AS
total_active_service_categories
FROM provider_catalog.service_categories
WHERE is_active = true;
```

##### Result / Interpretation

Interpretation: 4 active service categories exist: Plumbing, Carpentry, Cleaning, and Electrical. However, only Plumbing has providers assigned. Carpentry, Cleaning, and Electrical have 0 providers (supply gap). See N-12 for full breakdown.

### N-11. What is the acceptance rate of our active providers?

**Persona:** Platform Admin / Operations  
**Category:** User Behavior

**Purpose:** To temporarily pause or penalize providers who consistently ignore job requests, ensuring jobs route to responsive workers.

**Why It's Needed:** If we cannot track this, the app risks routing jobs to unresponsive providers, causing long customer wait times and cancelled orders.

#### Column Mapping per Business Question

| Schema.Table | Column(s) | Description | Availability | Derivation Formula |
| --- | --- | --- | --- | --- |
| booking.bookings<br>& identity_and_user.users | provider_id,<br>status, full_name | Calculates the percentage of<br>job requests a provider<br>accepts by counting<br>confirmed/in_progress/complet<br>ed vs. total bookings offered. | Derived | COUNT(id) FILTER<br>(WHERE status IN<br>('confirmed','in_progr<br>ess','completed'))<br>*100.0 / COUNT(id) |

#### SQL Query & Result

##### SQL Query

```sql
SELECT
b.provider_id,
u.full_name AS provider_name,
COUNT(b.id) AS total_jobs_offered,
COUNT(b.id) FILTER (WHERE b.status IN
('confirmed','in_progress','completed'))
AS jobs_accepted,
ROUND(COUNT(b.id) FILTER (WHERE b.status
IN
('confirmed','in_progress','completed'))
*100.0/COUNT(b.id),2)
AS acceptance_rate_percentage
FROM booking.bookings b
LEFT JOIN identity_and_user.users u
ON b.provider_id = u.id
GROUP BY b.provider_id, u.full_name
ORDER BY acceptance_rate_percentage ASC;
```

##### Result / Interpretation

_No textual result was captured in the PDF conversion; the original may show a screenshot or blank result cell._

### N-12. What is the total number of providers assigned to each service type?

**Persona:** Platform Admin / Operations  
**Category:** Business Management

**Purpose:** To promote campaigns specifically toward filling shortages in service categories.

**Why It's Needed:** If we cannot track this, we risk major blind spots in workforce supply, leading to unfulfilled customer requests for specific services.

#### Column Mapping per Business Question

| Schema.Table | Column(s) | Description | Availability | Derivation Formula |
| --- | --- | --- | --- | --- |
| provider_catalog.service_categories | id, name, is_active | Provides the list of all active<br>service categories as the base<br>for the count. | Direct | WHERE sc.is_active =<br>true |
| provider_catalog.provider_services | provider_id,<br>category_id | Links providers to the specific<br>service categories they are<br>assigned to. | Direct | COUNT(DISTINCT<br>ps.provider_id)<br>GROUP BY sc.name |

#### SQL Query & Result

##### SQL Query

```sql
SELECT
sc.name AS service_category,
COUNT(DISTINCT ps.provider_id) AS
total_providers
FROM provider_catalog.service_categories sc
LEFT JOIN provider_catalog.provider_services
ps
ON sc.id = ps.category_id
WHERE sc.is_active = true
GROUP BY sc.name
ORDER BY total_providers DESC;
```

##### Result / Interpretation

Interpretation: Only Plumbing has providers (25). Carpentry, Cleaning, and Electrical have ZERO providers critical supply gap. Immediate recruitment campaigns needed for these 3 categories.

## Schema: booking

**Tables:** bookings, bookings_cancellations, booking_reschedule_requests, additional_charges, booking_attachments,

provider_availability, provider_days_off

### B-1. What is the average lead time (in hours) between booking creation and the scheduled service?

**Persona:** Customer / User  
**Category:** Customer / User Behavior

**Purpose:** To understand how far in advance both users plan and schedule services.

**Why It's Needed:** Helps in predicting future demand, managing provider schedules, and knowing when to send promotional reminders.

#### Column Mapping per Business Question

| Schema.Table | Column(s) | Description | Availability | Derivation Formula |
| --- | --- | --- | --- | --- |
| booking.bookings | created_at,<br>scheduled_at | Used to calculate the exact<br>time difference between when<br>the user tapped 'book' and<br>when the service is meant to<br>happen, converted into hours. | Derived | AVG(EXTRACT(EPOCH FROM<br>(scheduled_at -<br>created_at))<br>/ 3600) AS<br>avg_lead_time_hours |

#### SQL Query & Result

##### SQL Query

```sql
SELECT
AVG(EXTRACT(EPOCH FROM
(scheduled_at - created_at))
/ 3600) AS avg_lead_time_hours
FROM booking.bookings
WHERE scheduled_at IS NOT NULL;
```

##### Result / Interpretation

_No textual result was captured in the PDF conversion; the original may show a screenshot or blank result cell._

### B-2. What is the overall completion rate for bookings?

**Persona:** Platform Admin  
**Category:** Business Management

**Purpose:** To measure the percentage of requests that successfully result in a finished job.

**Why It's Needed:** A low completion rate highlights issues in the app, either providers aren't showing up, or users are finding the process too difficult to finish.

#### Column Mapping per Business Question

| Schema.Table | Column(s) | Description | Availability | Derivation Formula |
| --- | --- | --- | --- | --- |
| booking.bookings | id, status | Used to find the proportion of<br>requested jobs that<br>successfully reach the end of<br>the booking lifecycle. | Derived | COUNT(CASE WHEN<br>status='completed'<br>THEN id END) AS<br>completed,<br>COUNT(id) AS total,<br>(completed/total) AS<br>rate |

#### SQL Query & Result

##### SQL Query

```sql
SELECT
COUNT(CASE WHEN status = 'completed'
THEN id END) AS completed_bookings,
COUNT(id) AS total_bookings,
(COUNT(CASE WHEN status = 'completed'
THEN id END) * 1.0 /
NULLIF(COUNT(id), 0))
AS completion_rate
FROM booking.bookings;
```

##### Result / Interpretation

_No textual result was captured in the PDF conversion; the original may show a screenshot or blank result cell._

### B-3. What is the cancellation rate across the platform?

**Persona:** Platform Admin  
**Category:** Issues

**Purpose:** To track the frequency of aborted bookings.

**Why It's Needed:** High cancellations waste provider time, reduce revenue, and can indicate poor user matching or pricing issues.

#### Column Mapping per Business Question

| Schema.Table | Column(s) | Description | Availability | Derivation Formula |
| --- | --- | --- | --- | --- |
| booking.bookings | id, status | Counts bookings with<br>status='cancelled' out of all<br>bookings to compute the<br>cancellation rate. Note:<br>bookings_cancellations table<br>(0 rows) tracks cancellation<br>details, the status field is the<br>source of truth for the count. | Derived | COUNT(id) FILTER<br>(WHERE<br>status='cancelled')<br>*1.0 / COUNT(id)<br>AS cancellation_rate |

#### SQL Query & Result

##### SQL Query

```sql
SELECT
COUNT(id) AS total_bookings,
COUNT(id) FILTER (WHERE
status='cancelled')
AS total_cancellations,
ROUND(COUNT(id) FILTER (WHERE
status='cancelled') * 100.0 /
NULLIF(COUNT(id), 0), 2)
AS cancellation_rate_pct
FROM booking.bookings;
```

##### Result / Interpretation

_No textual result was captured in the PDF conversion; the original may show a screenshot or blank result cell._

### B-4. What is the booking acceptance rate by service providers?

**Persona:** Platform Admin / Operations  
**Category:** User Behavior

**Purpose:** To measure how willing and available providers are to accept incoming jobs.

**Why It's Needed:** If acceptance rates are low, customers will experience longer wait times or rejections, suggesting a need to motivate or incentivize providers.

#### Column Mapping per Business Question

| Schema.Table | Column(s) | Description | Availability | Derivation Formula |
| --- | --- | --- | --- | --- |
| booking.bookings | id, status | Measures the volume of<br>bookings that move past the<br>initial 'pending' state into an<br>active or accepted state by the<br>provider. Valid enum values:<br>pending, confirmed,<br>in_progress, completed,<br>cancelled, disputed. | Derived | COUNT(CASE WHEN status<br>!= 'pending'<br>THEN id END) AS<br>accepted,<br>(accepted/total) AS<br>acceptance_rate |

#### SQL Query & Result

##### SQL Query

```sql
SELECT
COUNT(CASE WHEN status != 'pending'
THEN id END) AS accepted_bookings,
COUNT(id) AS total_bookings,
ROUND((COUNT(CASE WHEN status != 'pending'
THEN id END) * 1.0 /
NULLIF(COUNT(id), 0)),4)
AS acceptance_rate
FROM booking.bookings;
```

##### Result / Interpretation

_No textual result was captured in the PDF conversion; the original may show a screenshot or blank result cell._

### B-5. What percentage of confirmed bookings experience at least one reschedule request?

**Persona:** Platform Admin / Provider  
**Category:** Issues

**Purpose:** To measure how often either party alters or reschedules the service time after confirming a booking.

**Why It's Needed:** High reschedule rates can indicate provider unreliability, poor initial scheduling availability, or misaligned expectations between customers and providers.

#### Column Mapping per Business Question

| Schema.Table | Column(s) | Description | Availability | Derivation Formula |
| --- | --- | --- | --- | --- |
| booking.bookings &<br>booking.booking_<br>reschedule_requests | id (bookings),<br>booking_id<br>(reschedule) | Used to compare the volume<br>of unique bookings that have a<br>linked reschedule request<br>against the total volume of all<br>bookings. | Derived | COUNT(DISTINCT<br>r.booking_id)<br>/<br>NULLIF(COUNT(DISTINCT<br>b.id),0)<br>AS reschedule_rate |

#### SQL Query & Result

##### SQL Query

```sql
SELECT
COUNT(DISTINCT b.id) AS total_bookings,
COUNT(DISTINCT r.booking_id)
AS total_rescheduled_bookings,
(COUNT(DISTINCT r.booking_id) * 1.0 /
NULLIF(COUNT(DISTINCT b.id), 0))
AS reschedule_rate
FROM booking.bookings b
LEFT JOIN
booking.booking_reschedule_requests r
ON b.id = r.booking_id;
```

##### Result / Interpretation

_No textual result was captured in the PDF conversion; the original may show a screenshot or blank result cell._

### B-6. What is the average monetary value of approved additional charges per booking?

**Persona:** Platform Admin / Finance  
**Category:** Business Management / Issues

**Purpose:** To understand how often initial pricing is insufficient and how much extra value providers generate through additional charges.

**Why It's Needed:** If additional charges are too frequent or too high, it causes user churn and distrust. It could also show legitimate upselling or out-of-scope work being properly compensated.

#### Column Mapping per Business Question

| Schema.Table | Column(s) | Description | Availability | Derivation Formula |
| --- | --- | --- | --- | --- |
| booking.additional_charges | amount, status | Used to calculate the average<br>extra cost applied to bookings<br>by summing the amounts of<br>only the 'approved' charges.<br>Filters out pending and<br>rejected charges. | Derived | AVG(CASE WHEN<br>status='approved'<br>THEN amount END)<br>AS<br>avg_additional_charge |

#### SQL Query & Result

##### SQL Query

```sql
SELECT
COUNT(CASE WHEN status = 'approved'
THEN id END) AS approved_charge_count,
SUM(CASE WHEN status = 'approved'
THEN amount END) AS
total_additional_revenue,
AVG(CASE WHEN status = 'approved'
THEN amount END) AS
avg_additional_charge
FROM booking.additional_charges;
```

##### Result / Interpretation

_No textual result was captured in the PDF conversion; the original may show a screenshot or blank result cell._

### B-7. What is the average active available hours scheduled by a provider per week?

**Persona:** Platform Admin / Operations  
**Category:** User Behavior

**Purpose:** To measure the capacity and availability of providers who utilize the scheduling system.

**Why It's Needed:** To ensure there is enough active provider coverage to meet user demand. If availability drops, user wait times and booking rejections will increase.

#### Column Mapping per Business Question

| Schema.Table | Column(s) | Description | Availability | Derivation Formula |
| --- | --- | --- | --- | --- |
| booking.provider_availability | user_id,<br>start_time,<br>end_time,<br>is_active | Used to calculate the total<br>duration of workable hours per<br>provider by subtracting the<br>start time from the end time<br>across all their active days of<br>the week. | Derived | SUM(CASE WHEN<br>is_active=true THEN<br>EXTRACT(EPOCH FROM<br>(end_time-start_time))<br>/3600<br>ELSE 0 END) AS<br>total_available_hours_per_week |

#### SQL Query & Result

##### SQL Query

```sql
SELECT
user_id,
SUM(CASE WHEN is_active = true
THEN EXTRACT(EPOCH FROM
(end_time - start_time)) / 3600
ELSE 0 END)
AS total_available_hours_per_week
FROM booking.provider_availability
GROUP BY user_id;
```

##### Result / Interpretation

_No textual result was captured in the PDF conversion; the original may show a screenshot or blank result cell._

## Schema: messages

**Tables:** conversations, messages, conversation_participants, message_attachments

### M-1. What is the average number of messages exchanged per conversation?

**Persona:** Platform Admin / Operations  
**Category:** Operational Efficiency

**Purpose:** To see if users have to chat too much just to get a job done.

**Why It's Needed:** If chats are too long, it means the booking process is probably confusing and needs UX improvement.

#### Column Mapping per Business Question

| Schema.Table | Column(s) | Description | Availability | Derivation Formula |
| --- | --- | --- | --- | --- |
| messages.conversations<br>messages.messages | id (conversations),<br>id (messages) | Used to understand<br>communication volume by<br>counting the number of<br>messages inside each<br>individual chat thread. | Derived | COUNT(m.id) AS<br>message_count<br>(grouped by<br>conversation_id) |

#### SQL Query & Result

##### SQL Query

```sql
SELECT
ROUND(AVG(msg_count)::numeric, 2)
AS avg_msgs_per_conversation,
MIN(msg_count) AS min_msgs,
MAX(msg_count) AS max_msgs
FROM (
SELECT conversation_id,
COUNT(*) AS msg_count
FROM messages.messages
GROUP BY conversation_id
) sub;
```

##### Result / Interpretation

Interpretation: 3.67 avg is in healthy range (4–8 threshold). Low min of 2 suggests some conversations close quickly. Max of 5 is normal. Data is limited (3 conversations seeded), more meaningful with production volume.

### M-2. How many separate conversations are created per booking context?

**Persona:** Platform Admin / Support  
**Category:** System Health

**Purpose:** To ensure all communication for a single job stays organized in one chat thread.

**Why It's Needed:** If messages are scattered across multiple chats, important details get lost and it becomes much harder for support to resolve disputes.

#### Column Mapping per Business Question

| Schema.Table | Column(s) | Description | Availability | Derivation Formula |
| --- | --- | --- | --- | --- |
| messages.conversations | id, context_id | Track if users create multiple<br>chat threads for a single job by<br>counting conversations linked<br>to the same booking context. | Derived | COUNT(id) (grouped by<br>context_id) |

#### SQL Query & Result

##### SQL Query

```sql
SELECT
c.id AS conversation_id,
c.context_id AS booking_id,
c.status AS conversation_status,
COUNT(m.id) AS message_count
FROM messages.conversations c
LEFT JOIN messages.messages m
ON m.conversation_id = c.id
GROUP BY c.id, c.context_id, c.status
ORDER BY message_count DESC;
```

##### Result / Interpretation

FLAG: Booking aaaaaaaa has 2 conversations (1 active + 1 closed), system health issue. Support cannot tell which thread is authoritative for that booking. Monitor in production: if any booking_id has >1 active conversation, alert.

### M-3. What is the average response time between messages in conversations?

**Persona:** Platform Admin / Operations  
**Category:** Customer / User Behavior

**Purpose:** To measure the efficiency of communication and the responsiveness between customer and provider.

**Why It's Needed:** If response times are too long, it can indicate poor engagement, app notification issues, or user frustration, which often leads to cancelled bookings or negative reviews.

#### Column Mapping per Business Question

| Schema.Table | Column(s) | Description | Availability | Derivation Formula |
| --- | --- | --- | --- | --- |
| messages.messages | conversation_id,<br>sender_id,<br>created_at | Used to measure the time<br>elapsed between a message<br>and the previous message<br>within the same conversation<br>thread using a LAG window<br>function to calculate overall<br>average responsiveness. | Derived | AVG(EXTRACT(EPOCH FROM<br>(created_at -<br>LAG(created_at)<br>OVER (PARTITION BY<br>conversation_id<br>ORDER BY created_at)))<br>/ 60)<br>AS<br>avg_response_time_minutes |

#### SQL Query & Result

##### SQL Query

```sql
WITH MessageResponseTimes AS (
SELECT
conversation_id, created_at,
LAG(created_at) OVER (
PARTITION BY conversation_id
ORDER BY created_at)
AS previous_message_at
FROM messages.messages
)
SELECT
ROUND(AVG(EXTRACT(EPOCH FROM
(created_at - previous_message_at))
/ 60)::numeric, 2)
AS avg_response_time_minutes
FROM MessageResponseTimes;
```

##### Result / Interpretation

Interpretation: Average of 3 minutes between messages, excellent response time (well below the 60-minute concern threshold). Seed data has 11 messages across 3 conversations. In production, flag conversations where avg response time exceeds 60 minutes per session.

### M-4. What is the ratio of active to closed conversations at any given time?

**Persona:** Platform Admin  
**Category:** Traffic Monitoring

**Purpose:** To monitor the volume of ongoing service communications versus resolved services.

**Why It's Needed:** A high volume of prolonged active conversations could indicate unresolved issues or disputes. A healthy turnover to 'closed' shows successful task completion and efficient app usage. Healthy target: ratio < 1.5.

#### Column Mapping per Business Question

| Schema.Table | Column(s) | Description | Availability | Derivation Formula |
| --- | --- | --- | --- | --- |
| messages.conversations | id, status | Used to determine the volume<br>of ongoing service chats<br>compared to resolved ones by<br>counting occurrences of each<br>status type (active vs. closed). | Derived | COUNT(CASE WHEN<br>status='active' THEN<br>id END)<br>*1.0 /<br>NULLIF(COUNT(CASE WHEN<br>status='closed' THEN<br>id END),0)<br>AS<br>active_to_closed_ratio |

#### SQL Query & Result

##### SQL Query

```sql
SELECT
COUNT(CASE WHEN status = 'active'
THEN id END) AS active_conversations,
COUNT(CASE WHEN status = 'closed'
THEN id END) AS closed_conversations,
(COUNT(CASE WHEN status = 'active'
THEN id END) * 1.0 /
NULLIF(COUNT(CASE WHEN status = 'closed'
THEN id END), 0))
AS active_to_closed_ratio
FROM messages.conversations;
```

##### Result / Interpretation

Interpretation: 2 active, 1 closed. Ratio of 2.0 means 2x more active than closed (for seed data with only 3 total this is expected). In production: ratio >3.0 may indicate unresolved issues or poor booking closure process. Healthy target: <1.5.

## Schema: notification_and_support

**Tables:** disputes, support_tickets, notifications

### NS-1. What is the volume of disputes raised and what is the resolution rate?

**Persona:** Platform Admin  
**Category:** Issues

**Purpose:** To monitor how many booking disputes exist on the platform, how quickly they are being resolved, and whether unresolved disputes are accumulating.

**Why It's Needed:** Unresolved disputes erode trust between customers and providers. A high dispute volume signals systemic problems with service quality or booking matching. A low resolution rate means customers and providers are left in limbo, leading to churn and potential legal exposure. Flag if resolution rate drops below 70%.

#### Column Mapping per Business Question

| Schema.Table | Column(s) | Description | Availability | Derivation Formula |
| --- | --- | --- | --- | --- |
| notification_and_support.disputes | dispute_id | Unique identifier for each<br>dispute. Used as the count<br>base for total dispute volume. | Direct | COUNT(*) AS<br>total_disputes |
| notification_and_support.disputes | booking_id | Links each dispute to the<br>specific booking it concerns.<br>Enables cross-referencing with<br>booking data. | Direct | JOIN to bookings if<br>needed |
| notification_and_support.disputes | raised_by | UUID of the user who raised<br>the dispute. Used to determine<br>who initiates disputes more. | Direct | GROUP BY raised_by |
| notification_and_support.disputes | status | Dispute lifecycle status:<br>pending, investigating,<br>resolved, rejected. | Direct | COUNT(*) FILTER (WHERE<br>status='resolved') |
| notification_and_support.disputes | resolved_at | Timestamp when dispute was<br>resolved. Used to calculate<br>average resolution time. | Direct | AVG(resolved_at -<br>created_at) |
| (derived) | resolution_rate_pct | % of disputes that have<br>reached 'resolved' status.<br>Below 70% = admin team<br>needs reinforcement. | Derived | COUNT(status='resolved<br>')*100.0<br>/ COUNT(*) AS<br>resolution_rate_pct |

#### SQL Query & Result

##### SQL Query

```sql
SELECT
COUNT(*) AS total_disputes,
COUNT(*) FILTER (WHERE status='resolved')
AS resolved,
COUNT(*) FILTER (WHERE status='pending')
AS pending,
COUNT(*) FILTER (WHERE
status='investigating')
AS investigating,
COUNT(*) FILTER (WHERE status='rejected')
AS rejected,
ROUND(COUNT(*) FILTER (WHERE
status='resolved')
*100.0/NULLIF(COUNT(*),0),2)
AS resolution_rate_pct
FROM notification_and_support.disputes;
```

##### Result / Interpretation

Interpretation (verified April 11, 2026): 20 disputes in system (seeded data). 10 resolved (50%), 5 pending admin review, 5 under active investigation, 0 rejected. Resolution rate of 50% is BELOW the 70% threshold. In production, investigate open disputes within 48 hours to maintain healthy resolution rates.

### NS-2. What is the volume and resolution status of support tickets?

**Persona:** Platform Admin  
**Category:** Issues

**Purpose:** To track how many users are submitting help requests, what the current backlog looks like, and how efficiently the support team is resolving them.

**Why It's Needed:** A growing backlog of open or in-progress tickets means users are not getting help in time. This leads to frustration, negative reviews, and churn. Without monitoring this, the admin team has no visibility into support load and cannot allocate resources appropriately.

#### Column Mapping per Business Question

| Schema.Table | Column(s) | Description | Availability | Derivation Formula |
| --- | --- | --- | --- | --- |
| notification_and_support.support_tickets | ticket_id | Unique identifier for each<br>support request. Used as<br>count base for total ticket<br>volume. | Direct | COUNT(*) AS<br>total_tickets |
| notification_and_support.support_tickets | user_id | UUID of the user who<br>submitted the ticket. Used to<br>identify repeat submitters or<br>users with persistent issues. | Direct | GROUP BY user_id |
| notification_and_support.support_tickets | subject | Short description of the issue.<br>Used to categorize and identify<br>common problem types across<br>tickets. | Direct | SELECT subject |
| notification_and_support.support_tickets | status | Ticket lifecycle status: open,<br>in_progress, resolved, closed. | Direct | COUNT(*) FILTER (WHERE<br>status='open') |
| notification_and_support.support_tickets | created_at,<br>updated_at | Timestamps for ticket<br>submission and last update.<br>Used to calculate average<br>resolution time. | Direct | updated_at -<br>created_at AS<br>resolution_time |
| (derived) | resolution_rate_pct | % of tickets that reached<br>'resolved' or 'closed' status out<br>of all tickets submitted. | Derived | COUNT(status IN<br>('resolved','closed'))<br>*100.0/COUNT(*) AS<br>resolution_rate_pct |

#### SQL Query & Result

##### SQL Query

```sql
SELECT
COUNT(*) AS total_tickets,
COUNT(*) FILTER (WHERE status='open')
AS open_tickets,
COUNT(*) FILTER (WHERE
status='in_progress')
AS in_progress,
COUNT(*) FILTER (WHERE status='resolved')
AS resolved,
COUNT(*) FILTER (WHERE status='closed')
AS closed,
ROUND(COUNT(*) FILTER (WHERE status IN
('resolved','closed'))*100.0
/NULLIF(COUNT(*),0),2)
AS resolution_rate_pct
FROM
notification_and_support.support_tickets;
```

##### Result / Interpretation

Interpretation (verified April 11, 2026): 15 support tickets (seeded data). 46.67% resolution rate (7 resolved+closed / 15 total). 8 tickets (4 open + 4 in_progress) still require attention. In production: monitor daily. Flag if open+in_progress count exceeds 20% of monthly ticket volume for 3 consecutive days.

### NS-3. What is the notification read rate across the platform?

**Persona:** Platform Admin / Operations  
**Category:** User Behavior

**Purpose:** To measure how engaged users are with platform notifications, whether push/in-app alerts are being seen and read after being sent.

**Why It's Needed:** If users are not reading notifications, they miss important updates like booking confirmations, provider arrivals, and payment receipts. A low read rate signals that notification delivery is broken, notification content is irrelevant, or users have disabled alerts, all of which reduce booking conversion rates. Flag if read rate drops below 50%.

#### Column Mapping per Business Question

| Schema.Table | Column(s) | Description | Availability | Derivation Formula |
| --- | --- | --- | --- | --- |
| notification_and_support.notifications | notification_id | Unique identifier per<br>notification. Used as the count<br>base for total notifications sent. | Direct | COUNT(*) AS<br>total_notifications |
| notification_and_support.notifications | user_id | UUID of the user the<br>notification was sent to. Used<br>to segment read rates per user<br>or role. | Direct | GROUP BY user_id |
| notification_and_support.notifications | is_read | Boolean flag, true if the user<br>opened/read the notification.<br>The primary attribute for this<br>BQ. | Direct | COUNT(*) FILTER (WHERE<br>is_read=true) |
| notification_and_support.notifications | type | Category of notification (e.g.,<br>booking_confirmed,<br>payment_received). Used to<br>see which notification types get<br>read most. | Direct | GROUP BY type |
| (derived) | read_rate_pct | % of sent notifications that<br>have been read by users.<br>Below 50% = notification<br>delivery or content issue. | Derived | COUNT(is_read=true)*10<br>0.0<br>/ COUNT(*) AS<br>read_rate_pct |

#### SQL Query & Result

##### SQL Query

```sql
SELECT
COUNT(*) AS total_notifications,
COUNT(*) FILTER (WHERE is_read=true)
AS total_read,
COUNT(*) FILTER (WHERE is_read=false)
AS total_unread,
ROUND(COUNT(*) FILTER (WHERE is_read=true)
*100.0/NULLIF(COUNT(*),0),2)
AS read_rate_pct
FROM notification_and_support.notifications;
```

##### Result / Interpretation

Interpretation: Notifications table has 0 rows (expected for seed data). Notifications populate from real platform events: booking confirmations, payment receipts, provider arrival alerts, etc. This query will be meaningful after 2 weeks of production usage. Set up weekly monitoring from Day 1 of launch.

### NS-4. What is the current status of disputes, support tickets, and notifications?

**Persona:** Admin  
**Category:** Issues

**Purpose:** Operational pulse monitoring, gives Admin a live count of unresolved issues and system-generated alerts.

**Why It's Needed:** Gives Admin a live pulse on unresolved issues and system-generated alerts. A single dashboard view prevents alert fatigue from running three separate queries.

#### Column Mapping per Business Question

| Schema.Table | Column(s) | Description | Availability | Derivation Formula |
| --- | --- | --- | --- | --- |
| notification_and_support.disputes | dispute_id,<br>booking_id,<br>status, raised_by | Used to count all active dispute<br>records and monitor<br>unresolved complaints on the<br>platform. | Existing | — |
| notification_and_support.support_tickets | ticket_id, status,<br>user_id | Used to count and monitor<br>support requests submitted by<br>customers and providers,<br>broken down by current<br>resolution status. | Existing | — |
| notification_and_support.notifications | notification_id,<br>type,<br>is_read, user_id | Used to track every system<br>alert sent to a user,<br>categorized by event type so<br>delivery rates and read<br>engagement can be monitored<br>per notification category. | Existing | — |

#### SQL Query & Result

##### SQL Query

```sql
SELECT
(SELECT COUNT(*) FROM
notification_and_support.disputes)
AS total_disputes,
(SELECT COUNT(*) FROM
notification_and_support.support_tickets)
AS total_tickets,
(SELECT COUNT(*) FROM
notification_and_support.notifications)
AS total_notifications;
```

##### Result / Interpretation

Interpretation (verified April 11, 2026): 20 disputes and 15 support tickets are now present (seeded). Notifications remain at 0 (populate from real platform events after launch). In production: run this as a daily admin morning check. Dispute count growing >5/day signals systemic quality issues.

## Schema: payment (Admin Persona)

**Tables:** payments, provider_payouts

### A-P1. What is the total platform revenue (commission) collected?

**Persona:** Admin  
**Category:** Business Management

**Purpose:** To track financial performance and measure how much the platform earns from commissions.

**Why It's Needed:** Tracks how much the platform earns from commissions for financial visibility, operations, and investor reporting.

#### Column Mapping per Business Question

| Schema.Table | Column(s) | Description | Availability | Derivation Formula |
| --- | --- | --- | --- | --- |
| payment.provider_payouts | commission_deducted,<br>net_amount,<br>total_earnings | Used to calculate how much<br>the platform retains per payout<br>versus how much the provider<br>receives, by comparing gross<br>earnings against commission<br>deducted and resulting net<br>amount. | Existing | — |
| payment.provider_payouts | provider_id | Used to count distinct<br>providers who have received<br>payouts during the reporting<br>period. | Existing | COUNT(DISTINCT<br>provider_id)<br>AS providers_paid |

#### SQL Query & Result

##### SQL Query

```sql
SELECT
COUNT(*) AS total_payouts,
COUNT(DISTINCT provider_id) AS
providers_paid,
ROUND(SUM(commission_deducted)::numeric,
2)
AS total_platform_revenue,
ROUND(SUM(net_amount)::numeric, 2)
AS total_provider_earnings,
ROUND(AVG(net_amount)::numeric, 2)
AS avg_payout,
ROUND(MIN(net_amount)::numeric, 2) AS
min_payout,
ROUND(MAX(net_amount)::numeric, 2) AS
max_payout
FROM payment.provider_payouts;
```

##### Result / Interpretation

Interpretation: Platform earned PHP 129,846.40 in commissions from 548 payout records across 25 providers. Average provider payout is PHP 2,132.51. Effective commission rate is 10% (derived: 129,846 / 1,298,464).

### A-P2. What is the payment completion rate across all transactions?

**Persona:** Admin  
**Category:** Issues

**Purpose:** Payment health monitoring, measures the % of payments that successfully complete.

**Why It's Needed:** A low rate signals a gateway problem that is leaking revenue. Measures the % of payments that successfully complete.

#### Column Mapping per Business Question

| Schema.Table | Column(s) | Description | Availability | Derivation Formula |
| --- | --- | --- | --- | --- |
| payment.payments | amount, status,<br>paid_at | Used to record the gross<br>amount charged, whether the<br>transaction completed, and<br>when it was paid, the base<br>fields for all payment volume<br>and revenue queries. | Existing | — |
| (derived) | payment_completion_rate | Used to find the proportion of<br>payment transactions that<br>successfully reached a<br>completed state, out of all<br>transactions recorded on the<br>platform. | Derived | COUNT(*) FILTER (WHERE<br>status='completed')<br>*100.0 / COUNT(*)<br>AS<br>payment_completion_rate |

#### SQL Query & Result

##### SQL Query

```sql
SELECT
status,
COUNT(*) AS count,
ROUND(SUM(amount)::numeric, 2) AS
total_amount,
ROUND(COUNT(*) * 100.0 /
SUM(COUNT(*)) OVER ()::numeric, 2) AS
pct
FROM payment.payments
GROUP BY status
ORDER BY count DESC;
```

##### Result / Interpretation

Interpretation: 49.73% completion rate is BELOW the 80% threshold. However, 0 failed and 0 refunded, all non-completed payments are in 'pending' status. This is a seed data artifact. In production, pending payments resolve to completed or failed within minutes.

### A-P3. Which providers have the highest dispute rate?

**Persona:** Admin  
**Category:** Issues

**Purpose:** Risk and fraud detection, identifies high-risk providers early so Admin can intervene before customer trust is damaged.

**Why It's Needed:** Identifies high-risk providers early so Admin can intervene before customer trust is damaged.

#### Column Mapping per Business Question

| Schema.Table | Column(s) | Description | Availability | Derivation Formula |
| --- | --- | --- | --- | --- |
| notification_and_support.disputes | dispute_id,<br>booking_id,<br>status, raised_by | Used to divide the number of<br>disputed bookings by the total<br>bookings per provider,<br>expressing how often a<br>provider's jobs result in a<br>formal complaint.<br>Cross-schema JOIN, no<br>DB-level FK (application-layer<br>enforced). | Existing | — |
| (derived) | dispute_rate_pct | % of a provider's bookings that<br>result in a formal dispute. | Derived | COUNT(d.dispute_id)*100.0<br>/<br>NULLIF(COUNT(b.id),0)<br>GROUP BY b.provider_id |

#### SQL Query & Result

##### SQL Query

```sql
SELECT
b.provider_id,
u.full_name,
COUNT(DISTINCT b.id) AS total_bookings,
COUNT(DISTINCT d.dispute_id) AS
dispute_count,
ROUND(COUNT(DISTINCT d.dispute_id)*100.0 /
NULLIF(COUNT(DISTINCT b.id),0), 2)
AS dispute_rate_pct
FROM booking.bookings b
JOIN identity_and_user.users u
ON b.provider_id = u.id
LEFT JOIN notification_and_support.disputes
d
ON d.booking_id = b.id
GROUP BY b.provider_id, u.full_name
HAVING COUNT(DISTINCT d.dispute_id) > 0
ORDER BY dispute_count DESC
LIMIT 10;
```

##### Result / Interpretation

Interpretation (verified April 11, 2026): Juan Perez handles the bulk of platform volume (503 bookings) with 18 disputes (3.58%), within acceptable range. Rachel Mercado and Richard Mendoza each have 1 dispute on only 2 bookings (50%), very small sample, not statistically meaningful. In production, flag any provider with dispute_rate_pct > 5% sustained over 30+ bookings. Immediate escalation if > 15%.

### A-P4. What is the breakdown of payment methods used on the platform?

**Persona:** Admin  
**Category:** Traffic Monitoring

**Purpose:** Payment method preference analysis, shows which payment channels customers prefer, guiding payment partner investment decisions.

**Why It's Needed:** Shows which payment channels customers prefer, guiding payment partner investment decisions.

#### Column Mapping per Business Question

| Schema.Table | Column(s) | Description | Availability | Derivation Formula |
| --- | --- | --- | --- | --- |
| payment.payments | method, amount | Used to group transactions by<br>payment channel and sum the<br>total value per channel,<br>showing which methods<br>customers prefer and how<br>much revenue each drives. | Existing | — |
| (derived) | method_share_pct | Percentage share of each<br>payment method out of all<br>transactions. Window function<br>over total count. | Derived | COUNT(*)*100.0/SUM(COUNT(*))<br>OVER () AS pct |

#### SQL Query & Result

##### SQL Query

```sql
SELECT
method,
COUNT(*) AS transaction_count,
ROUND(SUM(amount)::numeric, 2)
AS total_amount,
ROUND(COUNT(*)*100.0 /
SUM(COUNT(*)) OVER ()::numeric, 2)
AS pct
FROM payment.payments
GROUP BY method
ORDER BY transaction_count DESC;
```

##### Result / Interpretation

Interpretation: GCash leads at 27.83%. All 4 methods are nearly equally used. GCash + Maya (digital wallets) account for 53.14%. COD at 24.06% indicates significant cash preference — important for service areas with limited connectivity.

## Schema: payment (Provider Persona)

**Tables:** payments, provider_payouts

### PR-P1. What is the average earnings per provider per month?

**Persona:** Provider  
**Category:** User Behavior

**Purpose:** Provider income analysis, determines whether providers earn enough from the platform to remain active.

**Why It's Needed:** Determines whether providers earn enough from the platform to remain active. If monthly earnings drop, providers will abandon the platform, directly reducing supply and customer satisfaction.

#### Column Mapping per Business Question

| Schema.Table | Column(s) | Description | Availability | Derivation Formula |
| --- | --- | --- | --- | --- |
| payment.provider_payouts | net_amount,<br>provider_id,<br>processed_at | Used to sum and average<br>each provider's net payout<br>amounts grouped by calendar<br>month, showing how much a<br>provider earns in a given<br>period. | Derived | SUM(net_amount) GROUP<br>BY<br>provider_id,<br>DATE_TRUNC('month',<br>processed_at) |

#### SQL Query & Result

##### SQL Query

```sql
SELECT
provider_id,
DATE_TRUNC('month', processed_at)
AS payout_month,
COUNT(*) AS payout_count,
ROUND(SUM(net_amount)::numeric, 2)
AS monthly_earnings,
ROUND(AVG(net_amount)::numeric, 2)
AS avg_payout_that_month
FROM payment.provider_payouts
GROUP BY provider_id,
DATE_TRUNC('month', processed_at)
ORDER BY provider_id, payout_month;
```

##### Result / Interpretation

Interpretation: Most providers have 1–2 payouts in March 2026 (seed data). cde862d5 (main provider) has ~500 payouts. One month of data exists in seed, trend analysis requires multiple months of production data.

### PR-P2. What is the average payout per provider?

**Persona:** Provider  
**Category:** User Behavior

**Purpose:** Payout benchmark, shows the typical payment a provider receives per completed booking.

**Why It's Needed:** Shows the typical payment a provider receives per completed booking, a key retention metric. If the average payout is too low, providers will seek other platforms.

#### Column Mapping per Business Question

| Schema.Table | Column(s) | Description | Availability | Derivation Formula |
| --- | --- | --- | --- | --- |
| payment.provider_payouts | net_amount,<br>provider_id | Used to compute the mean net<br>payout per provider across all<br>their payout records, giving a<br>single benchmark figure for<br>typical provider earnings. | Derived | AVG(net_amount) GROUP<br>BY provider_id |

#### SQL Query & Result

##### SQL Query

```sql
SELECT
provider_id,
COUNT(*) AS total_payouts,
ROUND(AVG(net_amount)::numeric, 2) AS
avg_payout,
ROUND(MIN(net_amount)::numeric, 2) AS
min_payout,
ROUND(MAX(net_amount)::numeric, 2) AS
max_payout
FROM payment.provider_payouts
GROUP BY provider_id
ORDER BY avg_payout DESC;
```

##### Result / Interpretation

Platform avg payout: PHP 2,132.51. All providers are above PHP 646 minimum — no provider earning critically low amounts in seed data.

### PR-P3. How much commission is deducted per payout?

**Persona:** Provider  
**Category:** Business Management

**Purpose:** Commission model validation, quantifies the platform's cut per transaction and validates the commission model's health.

**Why It's Needed:** Providers need to understand their exact cost of using the platform to decide if it's worth staying. Note: no commission_rate column exists in schema, rate is derived post-hoc from stored amounts

#### Column Mapping per Business Question

| Schema.Table | Column(s) | Description | Availability | Derivation Formula |
| --- | --- | --- | --- | --- |
| payment.provider_payouts | commission_deducted,<br>total_earnings | Used to calculate how much<br>the platform retains per payout<br>versus how much the provider<br>receives, and derive the<br>effective commission rate<br>percentage. | Existing | — |
| (derived) | avg_commission_rate_pct | Effective commission rate per<br>provider. Calculated from<br>commission_deducted /<br>total_earnings * 100. Note: no<br>commission_rate column<br>exists, this must be derived. | Derived | AVG(commission_deducted*100.0<br>/<br>NULLIF(total_earnings,<br>0)) |

#### SQL Query & Result

##### SQL Query

```sql
SELECT
provider_id,
COUNT(*) AS total_payouts,
ROUND(AVG(commission_deducted)::numeric,
2)
AS avg_commission,
ROUND(SUM(commission_deducted)::numeric,
2)
AS total_commission,
ROUND(AVG(commission_deducted*100.0 /
NULLIF(total_earnings,0))::numeric, 2)
AS rate_pct
FROM payment.provider_payouts
GROUP BY provider_id
ORDER BY total_commission DESC;
```

##### Result / Interpretation

Interpretation: Flat 10% commission rate applies uniformly to all providers. Commission model is consistent and validated. cde862d5 paid PHP 120,667 in total commission, majority of platform revenue.

### PR-P4. What is the total net earnings paid out to all providers?

**Persona:** Provider  
**Category:** Business Management

**Purpose:** Supply side financial health, measures total provider earnings as a supply-side health indicator for the marketplace.

**Why It's Needed:** Measures total provider earnings as a supply-side health indicator for the marketplace. If total provider earnings are declining, it signals platform contraction and supply-side risk.

#### Column Mapping per Business Question

| Schema.Table | Column(s) | Description | Availability | Derivation Formula |
| --- | --- | --- | --- | --- |
| payment.provider_payouts | net_amount,<br>provider_id | Used to sum all net payout<br>amounts across all providers<br>and payout records, giving the<br>total money distributed to the<br>supply side of the marketplace. | Derived | SUM(net_amount) AS<br>total_net_earnings |
| payment.provider_payouts | status, payout_id | Used to break down payout<br>records by processing state to<br>identify how many payouts are<br>completed, still pending, or<br>failed. | Existing | — |

#### SQL Query & Result

##### SQL Query

```sql
SELECT
COUNT(DISTINCT provider_id) AS
providers_paid,
COUNT(*) AS total_payouts,
ROUND(SUM(net_amount)::numeric, 2)
AS total_net_earnings,
ROUND(AVG(net_amount)::numeric, 2) AS
avg_payout,
ROUND(MIN(net_amount)::numeric, 2) AS
min_payout,
ROUND(MAX(net_amount)::numeric, 2) AS
max_payout
FROM payment.provider_payouts;
```

##### Result / Interpretation

_No textual result was captured in the PDF conversion; the original may show a screenshot or blank result cell._

## Schema: trust_and_reputation

**Tables:** reviews, provider_profile_reports

### T-1. What is the average rating per provider? (All-time and Rolling 30-Day)

**Persona:** Admin / Customer / Provider  
**Category:** User Behavior

**Purpose:** To identify top-performing providers for ranking and flag low-rated providers for intervention.

**Why It's Needed:** Ratings are the primary trust signal for customers choosing a provider. Providers below 3.5 average damage platform reputation. Rolling 30-day detects recent drops even when all-time average still looks healthy.

#### Column Mapping per Business Question

| Schema.Table | Column(s) | Description | Availability | Derivation Formula |
| --- | --- | --- | --- | --- |
| trust_and_reputation.reviews | rating, reviewee_id | Used to aggregate all star<br>scores submitted against a<br>provider's UUID, producing an<br>all-time average rating per<br>provider across every<br>completed booking they have<br>received. | Existing |  |
| (derived) | rolling_avg_rating | Used to average only the<br>ratings submitted within the<br>last 30 days per provider, so<br>recent drops in service quality<br>are visible even when the<br>all-time average still looks<br>healthy. | Derived | AVG(rating)<br>WHERE created_at >=<br>NOW() - INTERVAL '30<br>days'<br>GROUP BY reviewee_id |

#### SQL Query & Result

##### SQL Query

```sql
-- All-time average rating per provider
SELECT
reviewee_id AS provider_id,
ROUND(AVG(rating)::numeric,2) AS
avg_rating,
COUNT(*) AS review_count
FROM trust_and_reputation.reviews
GROUP BY reviewee_id
ORDER BY avg_rating DESC;
-- Rolling 30-day average
SELECT reviewee_id AS provider_id,
ROUND(AVG(rating)::numeric,2) AS
rolling_avg_30d
FROM trust_and_reputation.reviews
WHERE created_at >= NOW() - INTERVAL '30
days'
GROUP BY reviewee_id;
```

##### Result / Interpretation

Rolling 30-day: 0 rows, all seed reviews are older than 30 days. All-time query used for Sprint 4 reporting. Note: provider_profiles.average_rating is a static stored value, query reviews table directly for accuracy.

## Complete Business Questions of ServEase

#### identity_and_user

| Code | Persona | Business Question | Schema |
| --- | --- | --- | --- |
| N-1 | Customer | Which city or province has the highest number of registered customers? | identity_and_user |
| N-2 | Customer | How many new customers registered this month? | identity_and_user |
| N-3 | Customer | What is the breakdown of customer account statuses? | identity_and_user |
| N-4 | Customer | What is the age demographic breakdown of our registered customers? | identity_and_user |
| N-5 | Customer | Which customers have not yet accepted the latest app policies? | identity_and_user |
| N-6 | Customer | How long has a customer been using the app? (Account Tenure) | identity_and_user |
| N-10 | Admin | How many provider accounts are currently suspended? | identity_and_user |
| N-13 | Admin | What is the monthly trend of new customer registrations? | identity_and_user |
| N-14 | Admin | What is the monthly trend of new provider registrations? | identity_and_user |
| N-15 | Admin | What is the daily active customer count over time? (Customer Retention) | identity_and_user |
| N-16 | Admin | What is the current ratio of active providers to active customers? | identity_and_user |

#### provider_catalog

| Code | Persona | Business Question | Schema |
| --- | --- | --- | --- |
| N-7 | Admin | What is the availability of verified providers? | provider_catalog |
| N-8 | Admin | Which provider KYC documents have been pending for more than 3 days? | provider_catalog |
| N-9 | Admin | What is the total number of unique services listed in the catalog? | provider_catalog |
| N-11 | Admin | What is the acceptance rate of our active providers? | provider_catalog |
| N-12 | Admin | What is the total number of providers assigned to each service type? | provider_catalog |

#### booking

| Code | Persona | Business Question | Schema |
| --- | --- | --- | --- |
| B-1 | Customer / Admin | What is the average lead time (in hours) between booking creation and the scheduled service? | booking |
| B-2 | Admin | What is the overall completion rate for bookings? | booking |
| B-3 | Admin | What is the cancellation rate across the platform? | booking |
| B-4 | Admin | What is the booking acceptance rate by service providers? | booking |

| Code | Persona | Business Question | Schema |
| --- | --- | --- | --- |
| B-5 | Admin / Provider | What percentage of confirmed bookings experience at least one reschedule request? | booking |
| B-6 | Admin / Finance | What is the average monetary value of approved additional charges per booking? | booking |
| B-7 | Admin / Provider | What is the average active available hours scheduled by a provider per week? | booking |

#### messages (Messaging Microservice)

| Code | Persona | Business Question | Schema |
| --- | --- | --- | --- |
| M-1 | Admin | What is the average number of messages exchanged per conversation? | messages |
| M-2 | Admin / Support | How many separate conversations are created per booking context? | messages |
| M-3 | Admin | What is the average response time between messages in conversations? | messages |
| M-4 | Admin | What is the ratio of active to closed conversations at any given time? | messages |

#### notification_and_support

| Code | Persona | Business Question | Schema |
| --- | --- | --- | --- |
| NS-1 | Admin | What is the volume of disputes raised and what is the resolution rate? | notification_and_support |
| NS-2 | Admin | What is the volume and resolution status of support tickets? | notification_and_support |
| NS-3 | Admin | What is the notification read rate across the platform? | notification_and_support |
| NS-4 | Admin | What is the current status of disputes, support tickets, and notifications? (Operational Pulse) | notification_and_support |

#### payment (Admin Persona)

| Code | Persona | Business Question | Schema |
| --- | --- | --- | --- |
| A-P1 | Admin | What is the total platform revenue (commission) collected? | payment |
| A-P2 | Admin | What is the payment completion rate across all transactions? | payment |
| A-P3 | Admin | Which providers have the highest dispute rate? | payment |
| A-P4 | Admin | What is the breakdown of payment methods used on the platform? | payment |

#### payment (Provider Persona)

| Code | Persona | Business Question | Schema |
| --- | --- | --- | --- |
| PR-P1 | Provider | What is the average earnings per provider per month? | payment |
| PR-P2 | Provider | What is the average payout per provider? | payment |
| PR-P3 | Provider | How much commission is deducted per payout? | payment |
| PR-P4 | Provider | What is the total net earnings paid out to all providers? | payment |

#### trust_and_reputation

| Code | Persona | Business Question | Schema |
| --- | --- | --- | --- |
| T-1 | Admin / Customer / Provider | What is the average rating per provider? (All-time and Rolling 30-Day) | trust_and_reputation |

## Predictive Data Models

**Tables:** reviews, provider_profile_reports

### PQ-1. Which customers are at risk of not booking again in the next 30 days?

**Persona:** Admin  
**Category:** User Behavior

**Purpose:** To identify top-performing providers for ranking and flag low-rated providers for intervention.

**Why It's Needed:** Ratings are the primary trust signal for customers choosing a provider. Providers below 3.5 average damage platform reputation. Rolling 30-day detects recent drops even when all-time average still looks healthy.

### Predictive (PRED) - What demand should ServEase expect?

- PRED-1 - Customers at risk of not booking again in 30 days

- PRED-2 - Completion rate forecast for next 7 days

- PRED-3 - Forecast reliability: MAE, MAPE, confidence intervals

- PRED-4 - Providers likely to drop below 3.5 star rating

- PRED-5 - Bookings at high dispute risk before completion

- PRED-6 - Preferred forecast model per category by lowest error

- PRED-7 - Provider earnings and supply churn risk

### Prescriptive (PRESC) - What can ServEase do?

- PRESC-1 - Priority order for at-risk customer vouchers

- PRESC-2 - 1:30 provider-to-customer capacity feasibility

- PRESC-3 - Surge pricing trigger for provider availability

- PRESC-4 - Barangays to target first for recruitment

- PRESC-5 - Proactive QA assignment for high-risk bookings

- PRESC-6 - Priority allocation for low-earning providers

- PRESC-7 - Admin intervention vs. suspension decision
