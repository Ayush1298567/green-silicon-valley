-- =====================================================
-- DATABASE TRIGGERS AND FUNCTIONS
-- =====================================================

-- =====================================================
-- AUTO-UPDATE TIMESTAMPS FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
DROP TRIGGER IF EXISTS update_users_timestamp ON users;
CREATE TRIGGER update_users_timestamp BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_schools_timestamp ON schools;
CREATE TRIGGER update_schools_timestamp BEFORE UPDATE ON schools
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_presentations_timestamp ON presentations;
CREATE TRIGGER update_presentations_timestamp BEFORE UPDATE ON presentations
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_volunteers_timestamp ON volunteers;
CREATE TRIGGER update_volunteers_timestamp BEFORE UPDATE ON volunteers
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_chapters_timestamp ON chapters;
CREATE TRIGGER update_chapters_timestamp BEFORE UPDATE ON chapters
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_intern_projects_timestamp ON intern_projects;
CREATE TRIGGER update_intern_projects_timestamp BEFORE UPDATE ON intern_projects
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_grants_timestamp ON grants;
CREATE TRIGGER update_grants_timestamp BEFORE UPDATE ON grants
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_donations_timestamp ON donations;
CREATE TRIGGER update_donations_timestamp BEFORE UPDATE ON donations
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_task_assignments_timestamp ON task_assignments;
CREATE TRIGGER update_task_assignments_timestamp BEFORE UPDATE ON task_assignments
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_scheduled_tasks_timestamp ON scheduled_tasks;
CREATE TRIGGER update_scheduled_tasks_timestamp BEFORE UPDATE ON scheduled_tasks
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_page_templates_timestamp ON page_templates;
CREATE TRIGGER update_page_templates_timestamp BEFORE UPDATE ON page_templates
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- =====================================================
-- SCHOOL PRESENTATION COUNT TRIGGER
-- =====================================================
CREATE OR REPLACE FUNCTION update_school_presentation_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    IF NEW.status = 'completed' AND (TG_OP = 'INSERT' OR OLD.status != 'completed') THEN
      UPDATE schools
      SET total_presentations_hosted = COALESCE(total_presentations_hosted, 0) + 1,
          last_presentation_date = NEW.date
      WHERE id = NEW.school_id;
    END IF;
  END IF;
  
  IF (TG_OP = 'UPDATE' AND OLD.status = 'completed' AND NEW.status != 'completed') THEN
    UPDATE schools
    SET total_presentations_hosted = GREATEST(COALESCE(total_presentations_hosted, 0) - 1, 0)
    WHERE id = OLD.school_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_school_count ON presentations;
CREATE TRIGGER update_school_count AFTER INSERT OR UPDATE ON presentations
  FOR EACH ROW EXECUTE FUNCTION update_school_presentation_count();

-- =====================================================
-- VOLUNTEER HOURS INCREMENT TRIGGER
-- =====================================================
CREATE OR REPLACE FUNCTION increment_volunteer_hours()
RETURNS TRIGGER AS $$
BEGIN
  -- When hours are approved, increment volunteer's total
  IF NEW.status = 'approved' AND (TG_OP = 'INSERT' OR OLD.status != 'approved') THEN
    UPDATE volunteers
    SET hours_total = COALESCE(hours_total, 0) + NEW.hours,
        presentations_completed = COALESCE(presentations_completed, 0) + 1,
        updated_at = now()
    WHERE user_id = NEW.volunteer_id;
  END IF;
  
  -- If hours were approved but now rejected/pending, decrement
  IF TG_OP = 'UPDATE' AND OLD.status = 'approved' AND NEW.status != 'approved' THEN
    UPDATE volunteers
    SET hours_total = GREATEST(COALESCE(hours_total, 0) - OLD.hours, 0),
        presentations_completed = GREATEST(COALESCE(presentations_completed, 0) - 1, 0),
        updated_at = now()
    WHERE user_id = OLD.volunteer_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_increment_volunteer_hours ON volunteer_hours;
CREATE TRIGGER auto_increment_volunteer_hours AFTER INSERT OR UPDATE ON volunteer_hours
  FOR EACH ROW EXECUTE FUNCTION increment_volunteer_hours();

-- =====================================================
-- CHAPTER REVIEW DATE AUTOMATION
-- =====================================================
CREATE OR REPLACE FUNCTION set_chapter_review_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.last_meeting_date IS NOT NULL THEN
    NEW.next_review_date = NEW.last_meeting_date + INTERVAL '6 months';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_review_date ON chapters;
CREATE TRIGGER set_review_date BEFORE INSERT OR UPDATE ON chapters
  FOR EACH ROW EXECUTE FUNCTION set_chapter_review_date();

-- =====================================================
-- TASK COMPLETION TRIGGER
-- =====================================================
CREATE OR REPLACE FUNCTION set_task_completion_date()
RETURNS TRIGGER AS $$
BEGIN
  -- When task status changes to completed, set completion date
  IF NEW.status = 'completed' AND (TG_OP = 'INSERT' OR OLD.status != 'completed') THEN
    NEW.completed_at = now();
  END IF;
  
  -- If task is no longer completed, clear completion date
  IF TG_OP = 'UPDATE' AND OLD.status = 'completed' AND NEW.status != 'completed' THEN
    NEW.completed_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_task_completion ON task_assignments;
CREATE TRIGGER set_task_completion BEFORE INSERT OR UPDATE ON task_assignments
  FOR EACH ROW EXECUTE FUNCTION set_task_completion_date();

-- =====================================================
-- SYSTEM LOG TRIGGER (for important events)
-- =====================================================
CREATE OR REPLACE FUNCTION log_important_events()
RETURNS TRIGGER AS $$
BEGIN
  -- Log when volunteer hours are approved
  IF TG_TABLE_NAME = 'volunteer_hours' AND NEW.status = 'approved' AND (TG_OP = 'INSERT' OR OLD.status != 'approved') THEN
    INSERT INTO system_logs (event_type, description, actor_id, target_table, target_id, metadata)
    VALUES (
      'volunteer_hours_approved',
      'Volunteer hours approved',
      NEW.approved_by,
      'volunteer_hours',
      NEW.id::text,
      jsonb_build_object('hours', NEW.hours, 'volunteer_id', NEW.volunteer_id)
    );
  END IF;
  
  -- Log when presentation is completed
  IF TG_TABLE_NAME = 'presentations' AND NEW.status = 'completed' AND (TG_OP = 'INSERT' OR OLD.status != 'completed') THEN
    INSERT INTO system_logs (event_type, description, actor_id, target_table, target_id, metadata)
    VALUES (
      'presentation_completed',
      'Presentation completed at ' || COALESCE((SELECT name FROM schools WHERE id = NEW.school_id), 'Unknown School'),
      NULL,
      'presentations',
      NEW.id::text,
      jsonb_build_object('school_id', NEW.school_id, 'topic', NEW.topic, 'date', NEW.date)
    );
  END IF;
  
  -- Log when task is assigned
  IF TG_TABLE_NAME = 'task_assignments' AND TG_OP = 'INSERT' THEN
    INSERT INTO system_logs (event_type, description, actor_id, target_table, target_id, metadata)
    VALUES (
      'task_assigned',
      'Task assigned: ' || NEW.title,
      NEW.assigned_by,
      'task_assignments',
      NEW.id::text,
      jsonb_build_object('assigned_to', NEW.assigned_to, 'priority', NEW.priority, 'due_date', NEW.due_date)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS log_volunteer_hours_events ON volunteer_hours;
CREATE TRIGGER log_volunteer_hours_events AFTER INSERT OR UPDATE ON volunteer_hours
  FOR EACH ROW EXECUTE FUNCTION log_important_events();

DROP TRIGGER IF EXISTS log_presentation_events ON presentations;
CREATE TRIGGER log_presentation_events AFTER INSERT OR UPDATE ON presentations
  FOR EACH ROW EXECUTE FUNCTION log_important_events();

DROP TRIGGER IF EXISTS log_task_events ON task_assignments;
CREATE TRIGGER log_task_events AFTER INSERT ON task_assignments
  FOR EACH ROW EXECUTE FUNCTION log_important_events();

-- =====================================================
-- LAST LOGIN TRIGGER
-- =====================================================
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET last_login_at = now()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: This would ideally be triggered by auth events
-- For now, we'll update last_login manually in the application

