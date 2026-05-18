-- Pricing tables are Payment Service-owned and accessed through service-role RPCs.

alter table payment.pricing_rule_sets enable row level security;

drop policy if exists pricing_rule_sets_service_role_all
  on payment.pricing_rule_sets;

create policy pricing_rule_sets_service_role_all
  on payment.pricing_rule_sets
  for all
  to service_role
  using (true)
  with check (true);

alter table payment.pricing_category_rules enable row level security;

drop policy if exists pricing_category_rules_service_role_all
  on payment.pricing_category_rules;

create policy pricing_category_rules_service_role_all
  on payment.pricing_category_rules
  for all
  to service_role
  using (true)
  with check (true);

alter table payment.pricing_fuel_index_snapshots enable row level security;

drop policy if exists pricing_fuel_index_snapshots_service_role_all
  on payment.pricing_fuel_index_snapshots;

create policy pricing_fuel_index_snapshots_service_role_all
  on payment.pricing_fuel_index_snapshots
  for all
  to service_role
  using (true)
  with check (true);

alter table payment.pricing_quote_snapshots enable row level security;

drop policy if exists pricing_quote_snapshots_service_role_all
  on payment.pricing_quote_snapshots;

create policy pricing_quote_snapshots_service_role_all
  on payment.pricing_quote_snapshots
  for all
  to service_role
  using (true)
  with check (true);

alter table payment.pricing_outlier_reviews enable row level security;

drop policy if exists pricing_outlier_reviews_service_role_all
  on payment.pricing_outlier_reviews;

create policy pricing_outlier_reviews_service_role_all
  on payment.pricing_outlier_reviews
  for all
  to service_role
  using (true)
  with check (true);
