-- ============================================================
-- Capital Placement Engine — Database Schema
-- Run this in your Supabase SQL Editor to set up the database
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'viewer'
        CHECK (role IN ('admin', 'placer', 'viewer', 'partner')),
    supabase_auth_id UUID UNIQUE,
    phone TEXT,
    firm_name TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ORGANIZATIONS
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'other'
        CHECK (type IN ('sponsor', 'developer', 'lender', 'investor', 'government', 'other')),
    sector TEXT CHECK (sector IN ('data_center', 'cre', 'hospitality', 'energy', 'infrastructure', 'manufacturing', 'tech')),
    website TEXT,
    hq_city TEXT,
    hq_state TEXT,
    employee_count INTEGER,
    annual_revenue_range TEXT,
    description TEXT,
    linkedin_url TEXT,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    source TEXT,
    created_by UUID REFERENCES users(id),
    archived_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CONTACTS
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    title TEXT,
    email TEXT,
    phone TEXT,
    linkedin_url TEXT,
    is_decision_maker BOOLEAN DEFAULT false,
    relationship_status TEXT DEFAULT 'cold'
        CHECK (relationship_status IN ('cold', 'warm', 'hot', 'active', 'inactive')),
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    source TEXT,
    created_by UUID REFERENCES users(id),
    archived_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PROJECTS
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    sector TEXT NOT NULL
        CHECK (sector IN ('data_center', 'cre', 'hospitality', 'energy', 'infrastructure', 'manufacturing', 'tech')),
    project_type TEXT
        CHECK (project_type IN ('ground_up', 'acquisition', 'refinance', 'expansion', 'renovation', 'recapitalization')),
    description TEXT,
    location_city TEXT,
    location_state TEXT,
    location_address TEXT,

    -- Financial
    total_project_cost DECIMAL(14,2),
    debt_sought DECIMAL(14,2),
    equity_sought DECIMAL(14,2),
    debt_secured DECIMAL(14,2) DEFAULT 0,
    equity_secured DECIMAL(14,2) DEFAULT 0,
    funding_gap DECIMAL(14,2) GENERATED ALWAYS AS (
        COALESCE(total_project_cost, 0) - COALESCE(debt_secured, 0) - COALESCE(equity_secured, 0)
    ) STORED,
    capital_type TEXT CHECK (capital_type IN ('debt', 'equity', 'both')),

    -- Pipeline
    stage TEXT DEFAULT 'discovered'
        CHECK (stage IN ('discovered', 'qualifying', 'engaged', 'submitted', 'under_review', 'closing', 'closed', 'dead')),
    priority_score INTEGER DEFAULT 0 CHECK (priority_score >= 0 AND priority_score <= 100),
    score_breakdown JSONB DEFAULT '{}',

    -- Timing
    target_close_date DATE,
    construction_start DATE,

    -- Fees
    estimated_fee_pct DECIMAL(4,2),
    estimated_fee_amount DECIMAL(12,2),
    kevin_share_pct DECIMAL(4,2) DEFAULT 50.00,
    kevin_estimated_fee DECIMAL(12,2),

    -- Source
    source_type TEXT CHECK (source_type IN ('rss', 'public_filing', 'news', 'linkedin', 'manual', 'csv_import', 'referral')),
    source_url TEXT,
    source_record_id UUID,

    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    archived_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SOURCE RECORDS
CREATE TABLE IF NOT EXISTS source_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_type TEXT NOT NULL
        CHECK (source_type IN ('rss', 'public_filing', 'news', 'linkedin', 'manual', 'csv_import', 'referral')),
    title TEXT NOT NULL,
    url TEXT,
    raw_content TEXT,
    extracted_data JSONB DEFAULT '{}',
    sector_guess TEXT CHECK (sector_guess IN ('data_center', 'cre', 'hospitality', 'energy', 'infrastructure', 'manufacturing', 'tech')),
    location_guess TEXT,
    amount_guess DECIMAL(14,2),
    relevance_score INTEGER DEFAULT 0,
    status TEXT DEFAULT 'new'
        CHECK (status IN ('new', 'reviewed', 'converted', 'dismissed')),
    converted_project_id UUID REFERENCES projects(id),
    dismissed_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. OPPORTUNITIES
CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    capital_source_org_id UUID REFERENCES organizations(id),
    capital_source_contact_id UUID REFERENCES contacts(id),
    opportunity_type TEXT NOT NULL
        CHECK (opportunity_type IN ('debt_placement', 'equity_placement', 'co_invest')),
    status TEXT DEFAULT 'identified'
        CHECK (status IN ('identified', 'approached', 'in_discussion', 'term_sheet', 'committed', 'closed', 'lost')),
    amount DECIMAL(14,2),
    fee_pct DECIMAL(4,2),
    fee_amount DECIMAL(12,2),
    notes TEXT,
    lost_reason TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. OUTREACH
CREATE TABLE IF NOT EXISTS outreach (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    channel TEXT NOT NULL
        CHECK (channel IN ('email', 'linkedin', 'phone', 'in_person', 'referral')),
    direction TEXT NOT NULL DEFAULT 'outbound'
        CHECK (direction IN ('outbound', 'inbound')),
    subject TEXT,
    body TEXT,
    template_id TEXT,
    status TEXT DEFAULT 'draft'
        CHECK (status IN ('draft', 'pending_approval', 'sent', 'delivered', 'opened', 'replied', 'bounced')),
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    sequence_position INTEGER,
    sequence_id TEXT,
    compliance_approved BOOLEAN DEFAULT false,
    compliance_approved_by UUID REFERENCES users(id),
    compliance_approved_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. NEWSLETTERS
CREATE TABLE IF NOT EXISTS newsletters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    subject_line TEXT,
    body_html TEXT,
    body_text TEXT,
    sector_focus TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'draft'
        CHECK (status IN ('draft', 'review', 'approved', 'scheduled', 'sent')),
    ai_draft JSONB DEFAULT '{}',
    editor_notes TEXT,
    recipient_count INTEGER DEFAULT 0,
    sent_at TIMESTAMPTZ,
    scheduled_at TIMESTAMPTZ,
    approved_by UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. COMPLIANCE LOG (IMMUTABLE — no UPDATE/DELETE allowed)
CREATE TABLE IF NOT EXISTS compliance_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES users(id),
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    details JSONB DEFAULT '{}',
    disclosure_text TEXT,
    firm_approval_required BOOLEAN DEFAULT false,
    firm_approved BOOLEAN,
    firm_approved_by TEXT,
    firm_approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ACTIVITY LOG
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_projects_stage ON projects(stage);
CREATE INDEX IF NOT EXISTS idx_projects_sector ON projects(sector);
CREATE INDEX IF NOT EXISTS idx_projects_score ON projects(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_projects_org ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_contacts_org ON contacts(organization_id);
CREATE INDEX IF NOT EXISTS idx_source_records_status ON source_records(status);
CREATE INDEX IF NOT EXISTS idx_source_records_sector ON source_records(sector_guess);
CREATE INDEX IF NOT EXISTS idx_outreach_contact ON outreach(contact_id);
CREATE INDEX IF NOT EXISTS idx_outreach_project ON outreach(project_id);
CREATE INDEX IF NOT EXISTS idx_outreach_status ON outreach(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_project ON opportunities(project_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);
CREATE INDEX IF NOT EXISTS idx_compliance_log_action ON compliance_log(action);
CREATE INDEX IF NOT EXISTS idx_compliance_log_entity ON compliance_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at DESC);

-- ============================================================
-- PROTECT COMPLIANCE LOG FROM UPDATES/DELETES
-- ============================================================

CREATE OR REPLACE FUNCTION prevent_compliance_log_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'compliance_log is immutable — updates and deletes are not allowed';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS compliance_log_immutable ON compliance_log;
CREATE TRIGGER compliance_log_immutable
    BEFORE UPDATE OR DELETE ON compliance_log
    FOR EACH ROW
    EXECUTE FUNCTION prevent_compliance_log_modification();

-- ============================================================
-- AUTO-UPDATE updated_at TIMESTAMPS
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_users BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_organizations BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_contacts BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_projects BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_opportunities BEFORE UPDATE ON opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_newsletters BEFORE UPDATE ON newsletters FOR EACH ROW EXECUTE FUNCTION update_updated_at();
