-- ============================================================================
-- DOCUMENT WORKFLOW MIGRATION
-- Migration: 0032_document_workflow.sql
-- Date: December 2024
-- Purpose: Add document upload and signing workflow for volunteers
-- ============================================================================

BEGIN;

-- ============================================================================
-- VOLUNTEER DOCUMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS volunteer_documents (
  id bigserial PRIMARY KEY,
  volunteer_id bigint REFERENCES volunteers(id) ON DELETE CASCADE,
  presentation_id bigint REFERENCES presentations(id) ON DELETE SET NULL,
  document_type text NOT NULL CHECK (document_type IN (
    'volunteer_signature_form',
    'teacher_signature_form',
    'hours_verification',
    'other'
  )),
  file_url text NOT NULL, -- Supabase Storage URL
  file_name text NOT NULL,
  file_size bigint,
  file_type text,
  status text DEFAULT 'pending' CHECK (status IN (
    'pending',
    'under_review',
    'approved',
    'rejected',
    'signed_by_founder',
    'completed'
  )),
  uploaded_by uuid REFERENCES users(id) ON DELETE SET NULL,
  uploaded_at timestamptz DEFAULT now(),
  reviewed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  signed_by uuid REFERENCES users(id) ON DELETE SET NULL, -- Founder who signed
  signed_at timestamptz,
  signed_document_url text, -- URL to signed document
  rejection_reason text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_volunteer_documents_volunteer ON volunteer_documents(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_documents_presentation ON volunteer_documents(presentation_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_documents_status ON volunteer_documents(status);
CREATE INDEX IF NOT EXISTS idx_volunteer_documents_uploaded ON volunteer_documents(uploaded_at DESC);

-- ============================================================================
-- DOCUMENT TEMPLATES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS document_templates (
  id bigserial PRIMARY KEY,
  template_name text NOT NULL,
  template_type text NOT NULL CHECK (template_type IN (
    'volunteer_signature_form',
    'teacher_signature_form',
    'hours_verification'
  )),
  file_url text NOT NULL, -- Template file URL
  description text,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_document_templates_type ON document_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_document_templates_active ON document_templates(is_active);

-- ============================================================================
-- ENHANCE PRESENTATIONS TABLE
-- ============================================================================

ALTER TABLE presentations ADD COLUMN IF NOT EXISTS documents_required boolean DEFAULT true;
ALTER TABLE presentations ADD COLUMN IF NOT EXISTS documents_submitted boolean DEFAULT false;
ALTER TABLE presentations ADD COLUMN IF NOT EXISTS documents_approved boolean DEFAULT false;

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE TRIGGER update_volunteer_documents_updated_at
  BEFORE UPDATE ON volunteer_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_templates_updated_at
  BEFORE UPDATE ON document_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TRIGGER TO CREATE NOTIFICATIONS FOR DOCUMENT UPLOADS
-- ============================================================================

CREATE OR REPLACE FUNCTION create_document_notification()
RETURNS TRIGGER AS $$
DECLARE
  founder_ids uuid[];
  volunteer_team_name text;
BEGIN
  -- Get volunteer team name
  SELECT team_name INTO volunteer_team_name FROM volunteers WHERE id = NEW.volunteer_id;
  
  -- Get all founder user IDs
  SELECT ARRAY_AGG(id) INTO founder_ids FROM users WHERE role = 'founder';
  
  -- Create notifications for founders when document is uploaded
  IF NEW.status = 'pending' AND founder_ids IS NOT NULL THEN
    INSERT INTO notifications (user_id, notification_type, title, message, action_url, related_id, related_type)
    SELECT 
      unnest(founder_ids),
      'presentation_submitted', -- Reuse notification type
      'New Document Uploaded',
      volunteer_team_name || ' uploaded a ' || NEW.document_type || ' document',
      '/dashboard/founder/documents/pending',
      NEW.id,
      'volunteer_document'
    WHERE NOT EXISTS (
      SELECT 1 FROM user_notification_preferences 
      WHERE user_id = unnest(founder_ids) 
      AND (notification_types->>'presentation_submitted'->>'in_app')::boolean = false
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_document_notification
  AFTER INSERT ON volunteer_documents
  FOR EACH ROW
  EXECUTE FUNCTION create_document_notification();

-- ============================================================================
-- RLS POLICIES FOR VOLUNTEER_DOCUMENTS
-- ============================================================================

ALTER TABLE volunteer_documents ENABLE ROW LEVEL SECURITY;

-- Volunteers can view their own team's documents
CREATE POLICY volunteer_documents_team_read ON volunteer_documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.user_id = auth.uid()
      AND tm.volunteer_team_id = volunteer_documents.volunteer_id
    )
  );

-- Volunteers can insert documents for their team
CREATE POLICY volunteer_documents_team_insert ON volunteer_documents
  FOR INSERT
  WITH CHECK (
    uploaded_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.user_id = auth.uid()
      AND tm.volunteer_team_id = volunteer_documents.volunteer_id
    )
  );

-- Founders/interns can view all documents
CREATE POLICY volunteer_documents_staff_read ON volunteer_documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('founder', 'intern')
    )
  );

-- Founders/interns can update documents
CREATE POLICY volunteer_documents_staff_update ON volunteer_documents
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('founder', 'intern')
    )
  );

-- ============================================================================
-- RLS POLICIES FOR DOCUMENT_TEMPLATES
-- ============================================================================

ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;

-- Everyone can view active templates
CREATE POLICY document_templates_read ON document_templates
  FOR SELECT
  USING (is_active = true OR EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('founder', 'intern')
  ));

-- Only founders/interns can manage templates
CREATE POLICY document_templates_manage ON document_templates
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('founder', 'intern')
    )
  );

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE volunteer_documents IS 'Documents uploaded by volunteers (signature forms, verification forms, etc.)';
COMMENT ON TABLE document_templates IS 'Templates for documents that volunteers need to print and fill out';
COMMENT ON COLUMN volunteer_documents.document_type IS 'Type of document: volunteer_signature_form, teacher_signature_form, hours_verification, other';
COMMENT ON COLUMN volunteer_documents.status IS 'Document status: pending, under_review, approved, rejected, signed_by_founder, completed';
COMMENT ON COLUMN volunteer_documents.signed_document_url IS 'URL to the final signed document (after founder signs)';

COMMIT;

