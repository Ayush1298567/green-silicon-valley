-- ============================================================================
-- SUPABASE STORAGE POLICIES
-- ============================================================================
-- Run this in Supabase SQL Editor AFTER creating the storage buckets
-- This sets up all the access policies for file uploads
-- ============================================================================

-- ============================================================================
-- MEDIA BUCKET POLICIES
-- ============================================================================

-- Anyone can view media files
CREATE POLICY "Anyone can view media"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

-- Authenticated users can upload media
CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'media' 
  AND auth.role() = 'authenticated'
);

-- Users can update their own uploads
CREATE POLICY "Users can update own media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'media'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Founders can delete any media
CREATE POLICY "Founders can delete media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'media'
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'founder'
  )
);

-- Users can delete their own uploads
CREATE POLICY "Users can delete own media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'media'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================================
-- BLOG COVERS BUCKET POLICIES
-- ============================================================================

-- Anyone can view blog covers
CREATE POLICY "Anyone can view blog covers"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-covers');

-- Blog authors can upload covers
CREATE POLICY "Blog authors can upload covers"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'blog-covers'
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND (
      role = 'founder' 
      OR permissions @> '["blog.create"]'::jsonb
    )
  )
);

-- Authors can update their own covers
CREATE POLICY "Authors can update own covers"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'blog-covers'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Founders can delete any cover
CREATE POLICY "Founders can delete blog covers"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'blog-covers'
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'founder'
  )
);

-- Authors can delete their own covers
CREATE POLICY "Authors can delete own covers"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'blog-covers'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================================
-- USER UPLOADS BUCKET POLICIES (PRIVATE)
-- ============================================================================

-- Users can view their own uploads
CREATE POLICY "Users can view own uploads"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'user-uploads'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can upload to their own folder
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-uploads'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update their own uploads
CREATE POLICY "Users can update own uploads"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'user-uploads'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own uploads
CREATE POLICY "Users can delete own uploads"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-uploads'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Founders can view all uploads
CREATE POLICY "Founders can view all uploads"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'user-uploads'
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'founder'
  )
);

-- Founders can delete any upload
CREATE POLICY "Founders can delete all uploads"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-uploads'
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'founder'
  )
);

-- ============================================================================
-- VERIFICATION SLIPS BUCKET POLICIES (PRIVATE)
-- ============================================================================

-- Users can view their own slips
CREATE POLICY "Users can view own slips"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'verification-slips'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can upload their own slips
CREATE POLICY "Users can upload own slips"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'verification-slips'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update their own slips
CREATE POLICY "Users can update own slips"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'verification-slips'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own slips
CREATE POLICY "Users can delete own slips"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'verification-slips'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Founders can view all slips
CREATE POLICY "Founders can view all slips"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'verification-slips'
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'founder'
  )
);

-- Users with volunteer approval permission can view slips
CREATE POLICY "Approvers can view slips"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'verification-slips'
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND (
      role = 'founder' 
      OR permissions @> '["volunteers.approve"]'::jsonb
    )
  )
);

-- Founders can delete any slip
CREATE POLICY "Founders can delete all slips"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'verification-slips'
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'founder'
  )
);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
  policy_count integer;
BEGIN
  -- Count storage policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'storage'
  AND tablename = 'objects';

  RAISE NOTICE '============================================';
  RAISE NOTICE 'STORAGE POLICIES VERIFICATION';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Total storage policies: %', policy_count;
  RAISE NOTICE '============================================';
  
  IF policy_count >= 20 THEN
    RAISE NOTICE '✅ All storage policies created successfully!';
  ELSE
    RAISE NOTICE '⚠️ Some policies may be missing. Expected ~20+, found %.', policy_count;
  END IF;
  
  RAISE NOTICE '============================================';
  RAISE NOTICE '🎉 Storage policies setup complete!';
  RAISE NOTICE '============================================';
END $$;

