-- ============================================================================
-- ENHANCE WEBSITE BUILDER MIGRATION
-- Migration: 0033_enhance_website_builder.sql
-- Date: December 2024
-- Purpose: Add image gallery support and enhance page sections
-- ============================================================================

BEGIN;

-- ============================================================================
-- ENHANCE PAGE_SECTIONS TABLE
-- ============================================================================

-- Add image_url column if it doesn't exist (for single image sections)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'page_sections' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE page_sections ADD COLUMN image_url text;
  END IF;
END $$;

-- Ensure content jsonb can store gallery images array
-- This is already supported by jsonb, but we'll add a comment
COMMENT ON COLUMN page_sections.content IS 'JSONB content. For galleries: {"images": [{"id": "...", "url": "...", "alt": "...", "order": 0}]}';

-- ============================================================================
-- CREATE STORAGE BUCKETS IF THEY DON'T EXIST
-- ============================================================================

-- Note: Storage buckets need to be created via Supabase Dashboard or API
-- This migration documents what buckets are needed:
-- 1. 'public' - Public media files (images, documents)
-- 2. 'documents' - Volunteer documents (with RLS)
-- 3. 'gallery' - Gallery images (public)
-- 4. 'website-images' - Website builder images (public)
-- 5. 'hero-images' - Hero section images (public)

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE page_sections IS 'Website page sections with drag-and-drop editing support';
COMMENT ON COLUMN page_sections.settings IS 'JSONB settings: {backgroundColor, textColor, padding, layout}';
COMMENT ON COLUMN page_sections.content IS 'JSONB content varies by type. Gallery: {images: [...]}, Hero: {headline, subtitle, backgroundImage, ctaText, ctaLink}, Image: {imageUrl, altText}';

COMMIT;

