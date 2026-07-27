-- Enable Row Level Security (RLS) on multi-tenant tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE renters ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS tenant_isolation_properties ON properties;
DROP POLICY IF EXISTS tenant_isolation_renters ON renters;
DROP POLICY IF EXISTS tenant_isolation_contracts ON contracts;
DROP POLICY IF EXISTS tenant_isolation_payments ON payments;
DROP POLICY IF EXISTS tenant_isolation_users ON users;

-- Create tenant isolation policies
-- current_setting('app.current_org', true) returns null if missing or empty
CREATE POLICY tenant_isolation_properties ON properties
  USING (organization_id = NULLIF(current_setting('app.current_org', true), '')::uuid);

CREATE POLICY tenant_isolation_renters ON renters
  USING (organization_id = NULLIF(current_setting('app.current_org', true), '')::uuid);

CREATE POLICY tenant_isolation_contracts ON contracts
  USING (organization_id = NULLIF(current_setting('app.current_org', true), '')::uuid);

CREATE POLICY tenant_isolation_payments ON payments
  USING (organization_id = NULLIF(current_setting('app.current_org', true), '')::uuid);

CREATE POLICY tenant_isolation_users ON users
  USING (organization_id = NULLIF(current_setting('app.current_org', true), '')::uuid);
