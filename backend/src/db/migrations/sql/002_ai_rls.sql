-- Enable RLS on new tables
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_tickets ENABLE ROW LEVEL SECURITY;

-- Drop existing if any
DROP POLICY IF EXISTS tenant_isolation_communications ON communications;
DROP POLICY IF EXISTS tenant_isolation_maintenance_tickets ON maintenance_tickets;

-- Create policies
CREATE POLICY tenant_isolation_communications ON communications
  USING (organization_id = NULLIF(current_setting('app.current_org', true), '')::uuid);

CREATE POLICY tenant_isolation_maintenance_tickets ON maintenance_tickets
  USING (organization_id = NULLIF(current_setting('app.current_org', true), '')::uuid);
