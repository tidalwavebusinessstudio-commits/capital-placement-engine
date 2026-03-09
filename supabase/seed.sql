-- ============================================================
-- Seed Data — Run after schema.sql and rls-policies.sql
-- Populates the same mock data from the app for testing
-- ============================================================

-- Organizations
INSERT INTO organizations (id, name, type, sector, website, hq_city, hq_state, description, source) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Vertex Data Systems', 'developer', 'data_center', 'https://vertexds.com', 'Ashburn', 'VA', 'Data center development & operations', 'conference'),
  ('10000000-0000-0000-0000-000000000002', 'Pinnacle Hospitality Group', 'sponsor', 'hospitality', 'https://pinnaclehosp.com', 'Fort Lauderdale', 'FL', 'Full-service hospitality development', 'referral'),
  ('10000000-0000-0000-0000-000000000003', 'Meridian CRE Partners', 'developer', 'cre', 'https://meridiancre.com', 'Dallas', 'TX', 'Multifamily and mixed-use development', 'linkedin'),
  ('10000000-0000-0000-0000-000000000004', 'SunGrid Energy', 'sponsor', 'energy', NULL, 'Phoenix', 'AZ', 'Utility-scale solar and battery storage', 'news'),
  ('10000000-0000-0000-0000-000000000005', 'Tidewater Infrastructure', 'sponsor', 'infrastructure', NULL, 'Norfolk', 'VA', 'Port and logistics infrastructure', 'manual');

-- Contacts
INSERT INTO contacts (id, organization_id, first_name, last_name, title, email, phone, is_decision_maker, relationship_status, source) VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Michael', 'Chen', 'VP Development', 'mchen@vertexds.com', '(703) 555-0142', true, 'hot', 'conference'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Sarah', 'Martinez', 'CEO', 'smartinez@pinnaclehosp.com', '(954) 555-0198', true, 'warm', 'referral'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'James', 'Wilson', 'Managing Partner', 'jwilson@meridiancre.com', '(214) 555-0167', true, 'active', 'linkedin'),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'Emily', 'Rodriguez', 'Director of Finance', 'erodriguez@sungrid.com', NULL, false, 'cold', 'news'),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 'David', 'Park', 'Principal', 'dpark@tidewater.com', '(757) 555-0133', true, 'warm', 'manual');

-- Projects
INSERT INTO projects (id, name, organization_id, sector, project_type, description, location_city, location_state,
  total_project_cost, debt_sought, equity_sought, debt_secured, equity_secured, capital_type,
  stage, priority_score, score_breakdown, target_close_date,
  estimated_fee_pct, estimated_fee_amount, kevin_share_pct, kevin_estimated_fee, source_type) VALUES
  ('30000000-0000-0000-0000-000000000001', 'Vertex Ashburn Campus Phase 2', '10000000-0000-0000-0000-000000000001',
    'data_center', 'ground_up', '120MW data center campus expansion',
    'Ashburn', 'VA', 180000000, 120000000, 60000000, 80000000, 20000000, 'both',
    'engaged', 88, '{"sector_fit":25,"deal_size_fit":18,"capital_gap_clarity":13,"geographic_desirability":15,"contact_quality":12,"timing_urgency":5,"total":88}',
    '2026-09-30', 5.0, 9000000, 50, 4500000, 'conference'),
  ('30000000-0000-0000-0000-000000000002', 'The Vue at Knox', '10000000-0000-0000-0000-000000000003',
    'cre', 'ground_up', 'Luxury 42-story multifamily tower',
    'Dallas', 'TX', 95000000, 65000000, 30000000, 65000000, 0, 'equity',
    'qualifying', 76, '{"sector_fit":20,"deal_size_fit":16,"capital_gap_clarity":12,"geographic_desirability":12,"contact_quality":10,"timing_urgency":6,"total":76}',
    '2026-12-15', 6.0, 5700000, 50, 2850000, 'linkedin'),
  ('30000000-0000-0000-0000-000000000003', 'Pinnacle Courtyard Ft. Lauderdale', '10000000-0000-0000-0000-000000000002',
    'hospitality', 'ground_up', '180-key Courtyard by Marriott',
    'Fort Lauderdale', 'FL', 52000000, 35000000, 17000000, 0, 0, 'both',
    'discovered', 65, '{"sector_fit":18,"deal_size_fit":14,"capital_gap_clarity":10,"geographic_desirability":10,"contact_quality":8,"timing_urgency":5,"total":65}',
    '2027-03-01', 5.5, 2860000, 50, 1430000, 'referral'),
  ('30000000-0000-0000-0000-000000000004', 'Tidewater Port Logistics Hub', '10000000-0000-0000-0000-000000000005',
    'infrastructure', 'expansion', 'Intermodal logistics facility',
    'Norfolk', 'VA', 220000000, 160000000, 60000000, 100000000, 40000000, 'both',
    'under_review', 72, '{"sector_fit":15,"deal_size_fit":18,"capital_gap_clarity":12,"geographic_desirability":12,"contact_quality":10,"timing_urgency":5,"total":72}',
    '2026-11-30', 4.5, 9900000, 50, 4950000, 'manual'),
  ('30000000-0000-0000-0000-000000000005', 'SunGrid Solar Farm', '10000000-0000-0000-0000-000000000004',
    'energy', 'ground_up', '200MW solar + 100MW battery storage',
    'Gila Bend', 'AZ', 98000000, 70000000, 28000000, 30000000, 0, 'both',
    'submitted', 68, '{"sector_fit":16,"deal_size_fit":15,"capital_gap_clarity":11,"geographic_desirability":10,"contact_quality":8,"timing_urgency":8,"total":68}',
    '2026-08-15', 4.0, 3920000, 50, 1960000, 'news');

-- Note: Run additional seed data for source_records, outreach, compliance_log, etc. as needed.
-- The app will function with the above core data.
