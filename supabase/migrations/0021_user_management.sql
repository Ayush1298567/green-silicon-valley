-- User Management Enhancements

-- Add additional user fields if they don't exist
DO $$ 
BEGIN
  -- Add status column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'status') THEN
    ALTER TABLE users ADD COLUMN status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'suspended'));
  END IF;

  -- Add phone column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'phone') THEN
    ALTER TABLE users ADD COLUMN phone text;
  END IF;

  -- Add address column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'address') THEN
    ALTER TABLE users ADD COLUMN address text;
  END IF;

  -- Add city column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'city') THEN
    ALTER TABLE users ADD COLUMN city text;
  END IF;

  -- Add state column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'state') THEN
    ALTER TABLE users ADD COLUMN state text DEFAULT 'CA';
  END IF;

  -- Add zip column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'zip') THEN
    ALTER TABLE users ADD COLUMN zip text;
  END IF;

  -- Add last_login column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'last_login') THEN
    ALTER TABLE users ADD COLUMN last_login timestamptz;
  END IF;

  -- Add notes column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'notes') THEN
    ALTER TABLE users ADD COLUMN notes text;
  END IF;

  -- Add profile_image column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'profile_image') THEN
    ALTER TABLE users ADD COLUMN profile_image text;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_role_status ON users(role, status);
CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_users_name_lower ON users(LOWER(name));

-- Update RLS policies to allow founders to manage all users
CREATE POLICY IF NOT EXISTS "Founders can manage all users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'founder'
    )
  );

-- Allow users with users.view permission to see users
CREATE POLICY IF NOT EXISTS "Users with permission can view users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (
        role = 'founder' 
        OR permissions @> '["users.view"]'::jsonb
      )
    )
  );

-- Allow users with users.edit permission to update users
CREATE POLICY IF NOT EXISTS "Users with permission can edit users" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (
        role = 'founder' 
        OR permissions @> '["users.edit"]'::jsonb
      )
    )
  );

-- Allow users with users.create permission to create users
CREATE POLICY IF NOT EXISTS "Users with permission can create users" ON users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (
        role = 'founder' 
        OR permissions @> '["users.create"]'::jsonb
      )
    )
  );

-- Allow users with users.delete permission to delete users
CREATE POLICY IF NOT EXISTS "Users with permission can delete users" ON users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (
        role = 'founder' 
        OR permissions @> '["users.delete"]'::jsonb
      )
    )
  );

-- Set all existing users to active status if null
UPDATE users SET status = 'active' WHERE status IS NULL;

