-- ============================================================================
-- SETUP FOUNDER USERS
-- ============================================================================
-- Run this SQL directly in Supabase SQL Editor
-- This will set up all founder users with the correct roles
-- ============================================================================

-- Insert or update founder users
INSERT INTO users (email, name, role, status) VALUES
('devshah2k09@gmail.com', 'Dev Shah', 'founder', 'active'),
('siddpokuri@gmail.com', 'Siddharth Pokuri', 'founder', 'active'),
('ayushg.2024@gmail.com', 'Ayush Gupta', 'founder', 'active'),
('abhiramtenneti2009@gmail.com', 'Abhiram Tenneti', 'founder', 'active'),
('sa.sc.2018@gmail.com', 'SA SC', 'founder', 'active')
ON CONFLICT (email) DO UPDATE SET
role = 'founder',
status = 'active',
updated_at = now();

-- Verify the setup
SELECT 'Founder Users Setup Complete' as status, COUNT(*) as founder_count
FROM users
WHERE role = 'founder' AND status = 'active';

-- List all founder users
SELECT email, name, role, status
FROM users
WHERE role = 'founder'
ORDER BY email;

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================
-- All founder users are now set up and can sign in to access admin features.
-- They will have access to:
-- - /admin - Complete admin panel
-- - /admin/website-builder - Edit website content
-- - /admin/user-manager - Manage all users
-- - All founder dashboards and features
-- ============================================================================
