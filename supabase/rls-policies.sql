-- ============================================================
-- Row Level Security (RLS) Policies
-- Run AFTER schema.sql in Supabase SQL Editor
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Helper: Get the user's role from the users table
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE supabase_auth_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================
-- Users: can read own profile, admins can read all
-- ============================================================
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (supabase_auth_id = auth.uid());

CREATE POLICY "Admins can read all users" ON users
  FOR SELECT USING (auth.user_role() IN ('admin', 'partner'));

-- ============================================================
-- All data tables: authenticated users can read, placers+ can write
-- ============================================================

-- Organizations
CREATE POLICY "Authenticated users can read organizations" ON organizations
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Placers can insert organizations" ON organizations
  FOR INSERT WITH CHECK (auth.user_role() IN ('admin', 'placer', 'partner'));

CREATE POLICY "Placers can update organizations" ON organizations
  FOR UPDATE USING (auth.user_role() IN ('admin', 'placer', 'partner'));

-- Contacts
CREATE POLICY "Authenticated users can read contacts" ON contacts
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Placers can insert contacts" ON contacts
  FOR INSERT WITH CHECK (auth.user_role() IN ('admin', 'placer', 'partner'));

CREATE POLICY "Placers can update contacts" ON contacts
  FOR UPDATE USING (auth.user_role() IN ('admin', 'placer', 'partner'));

-- Projects
CREATE POLICY "Authenticated users can read projects" ON projects
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Placers can insert projects" ON projects
  FOR INSERT WITH CHECK (auth.user_role() IN ('admin', 'placer', 'partner'));

CREATE POLICY "Placers can update projects" ON projects
  FOR UPDATE USING (auth.user_role() IN ('admin', 'placer', 'partner'));

-- Source Records
CREATE POLICY "Authenticated users can read sources" ON source_records
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Placers can insert sources" ON source_records
  FOR INSERT WITH CHECK (auth.user_role() IN ('admin', 'placer', 'partner'));

CREATE POLICY "Placers can update sources" ON source_records
  FOR UPDATE USING (auth.user_role() IN ('admin', 'placer', 'partner'));

-- Opportunities
CREATE POLICY "Authenticated users can read opportunities" ON opportunities
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Placers can insert opportunities" ON opportunities
  FOR INSERT WITH CHECK (auth.user_role() IN ('admin', 'placer', 'partner'));

CREATE POLICY "Placers can update opportunities" ON opportunities
  FOR UPDATE USING (auth.user_role() IN ('admin', 'placer', 'partner'));

-- Outreach
CREATE POLICY "Authenticated users can read outreach" ON outreach
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Placers can insert outreach" ON outreach
  FOR INSERT WITH CHECK (auth.user_role() IN ('admin', 'placer', 'partner'));

-- Newsletters
CREATE POLICY "Authenticated users can read newsletters" ON newsletters
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage newsletters" ON newsletters
  FOR ALL USING (auth.user_role() IN ('admin', 'partner'));

-- Compliance Log (read-only for most, insert for system)
CREATE POLICY "Authenticated users can read compliance log" ON compliance_log
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Placers can insert compliance entries" ON compliance_log
  FOR INSERT WITH CHECK (auth.user_role() IN ('admin', 'placer', 'partner'));

-- Activity Log
CREATE POLICY "Authenticated users can read activity log" ON activity_log
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert activity" ON activity_log
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
