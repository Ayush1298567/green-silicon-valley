#!/usr/bin/env tsx

/**
 * Content Migration Script
 *
 * This script extracts static content from React components and migrates it to the CMS.
 * It scans component files for hard-coded text and creates corresponding content blocks.
 */

import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Content blocks to migrate
interface ContentBlock {
  key: string;
  title: string;
  content: string;
  rich_content?: string;
  category: string;
  edit_permissions?: any;
  version_history?: any[];
}

// Static content found in components
const STATIC_CONTENT_BLOCKS: ContentBlock[] = [
  // Homepage content
  {
    key: 'homepage_hero_title',
    title: 'Homepage Hero Title',
    content: 'Empowering Environmental STEM Education',
    category: 'homepage',
    edit_permissions: { roles: ['founder', 'intern'] }
  },
  {
    key: 'homepage_hero_subtitle',
    title: 'Homepage Hero Subtitle',
    content: 'Green Silicon Valley connects students, educators, and innovators to create a sustainable future through environmental science and technology education.',
    category: 'homepage',
    edit_permissions: { roles: ['founder', 'intern'] }
  },
  {
    key: 'homepage_mission_title',
    title: 'Our Mission Title',
    content: 'Our Mission',
    category: 'homepage',
    edit_permissions: { roles: ['founder', 'intern'] }
  },
  {
    key: 'homepage_mission_content',
    title: 'Our Mission Content',
    content: 'Green Silicon Valley is dedicated to making environmental STEM education accessible to all students. We partner with schools, community organizations, and technology companies to create innovative learning experiences that inspire the next generation of environmental leaders.',
    category: 'homepage',
    edit_permissions: { roles: ['founder', 'intern'] }
  },

  // About page content
  {
    key: 'about_what_we_do_title',
    title: 'What We Do Title',
    content: 'What We Do',
    category: 'about',
    edit_permissions: { roles: ['founder', 'intern'] }
  },
  {
    key: 'about_what_we_do_content',
    title: 'What We Do Content',
    content: 'We provide free environmental STEM presentations to schools, develop curriculum resources, host workshops for educators, and create opportunities for students to engage with real-world environmental challenges through technology and innovation.',
    category: 'about',
    edit_permissions: { roles: ['founder', 'intern'] }
  },

  // Volunteer portal content
  {
    key: 'volunteer_welcome_title',
    title: 'Volunteer Welcome Title',
    content: 'Welcome to Our Volunteer Community',
    category: 'volunteer_portal',
    edit_permissions: { roles: ['founder', 'intern'] }
  },
  {
    key: 'volunteer_welcome_content',
    title: 'Volunteer Welcome Content',
    content: 'Thank you for your interest in volunteering with Green Silicon Valley! Our volunteers play a crucial role in delivering environmental STEM education to schools across the Bay Area.',
    category: 'volunteer_portal',
    edit_permissions: { roles: ['founder', 'intern'] }
  },

  // Teacher portal content
  {
    key: 'teacher_resources_title',
    title: 'Teacher Resources Title',
    content: 'Environmental STEM Resources for Educators',
    category: 'teacher_portal',
    edit_permissions: { roles: ['founder', 'intern'] }
  },
  {
    key: 'teacher_resources_intro',
    title: 'Teacher Resources Introduction',
    content: 'Access our collection of environmental STEM educational materials, lesson plans, and presentation resources designed to enhance your classroom teaching.',
    category: 'teacher_portal',
    edit_permissions: { roles: ['founder', 'intern'] }
  },

  // Forms instructional text
  {
    key: 'volunteer_form_instructions',
    title: 'Volunteer Application Instructions',
    content: 'Please fill out this form to join our volunteer team. We review applications within 1-3 business days. Once approved, you\'ll receive information about upcoming training and volunteer opportunities.',
    category: 'forms_instructional_text',
    edit_permissions: { roles: ['founder', 'intern'] }
  },
  {
    key: 'teacher_request_instructions',
    title: 'Teacher Presentation Request Instructions',
    content: 'Request a free environmental STEM presentation for your classroom. We\'ll confirm your request and schedule a presentation at your convenience.',
    category: 'forms_instructional_text',
    edit_permissions: { roles: ['founder', 'intern'] }
  }
];

/**
 * Extract static content from component files
 */
async function extractStaticContent(): Promise<ContentBlock[]> {
  const componentsDir = path.join(process.cwd(), 'components');
  const pagesDir = path.join(process.cwd(), 'app');
  const extractedContent: ContentBlock[] = [];

  console.log('🔍 Scanning components for static content...');

  // Scan common component files that might contain static content
  const filesToScan = [
    'components/layout/Hero.tsx',
    'components/sections/Mission.tsx',
    'components/sections/About.tsx',
    'app/page.tsx',
    'app/about/page.tsx',
    'components/forms/VolunteerForm.tsx',
    'components/forms/TeacherRequestForm.tsx'
  ];

  for (const filePath of filesToScan) {
    try {
      const fullPath = path.join(process.cwd(), filePath);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf-8');

        // Look for common patterns of static text
        const textPatterns = [
          /['"`]([^'"`]{20,200}?)['"`]/g, // Quoted strings of reasonable length
          /(?:title|heading|description|content)['"`]\s*:\s*['"`]([^'"`]{10,300}?)['"`]/gi // Object properties
        ];

        for (const pattern of textPatterns) {
          let match;
          while ((match = pattern.exec(content)) !== null) {
            const extractedText = match[1]?.trim();
            if (extractedText &&
                extractedText.length > 10 &&
                !extractedText.includes('{') && // Skip dynamic content
                !extractedText.includes('props') && // Skip prop references
                !extractedText.includes('import') && // Skip imports
                !/^\w+\./.test(extractedText)) { // Skip method calls

              // Create a content block key from the file path and text
              const fileName = path.basename(filePath, path.extname(filePath));
              const key = `${fileName}_${extractedText.slice(0, 20).toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}`;

              // Check if we already have this content
              const exists = extractedContent.some(block => block.content === extractedText) ||
                           STATIC_CONTENT_BLOCKS.some(block => block.content === extractedText);

              if (!exists) {
                extractedContent.push({
                  key,
                  title: `${fileName}: ${extractedText.slice(0, 30)}...`,
                  content: extractedText,
                  category: getCategoryFromFile(filePath),
                  edit_permissions: { roles: ['founder', 'intern'] }
                });
              }
            }
          }
        }
      }
    } catch (error) {
      console.warn(`⚠️  Could not scan ${filePath}:`, error);
    }
  }

  console.log(`📝 Extracted ${extractedContent.length} additional content blocks from components`);
  return extractedContent;
}

/**
 * Determine category based on file path
 */
function getCategoryFromFile(filePath: string): string {
  if (filePath.includes('volunteer') || filePath.includes('Volunteer')) {
    return 'volunteer_portal';
  }
  if (filePath.includes('teacher') || filePath.includes('Teacher')) {
    return 'teacher_portal';
  }
  if (filePath.includes('form') || filePath.includes('Form')) {
    return 'forms_instructional_text';
  }
  if (filePath.includes('about') || filePath.includes('About')) {
    return 'about';
  }
  return 'homepage';
}

/**
 * Migrate content blocks to database
 */
async function migrateContentBlocks(contentBlocks: ContentBlock[]): Promise<void> {
  console.log(`🚀 Migrating ${contentBlocks.length} content blocks to CMS...`);

  for (const block of contentBlocks) {
    try {
      // Check if block already exists
      const { data: existing } = await supabase
        .from('content_blocks')
        .select('id')
        .eq('block_key', block.key)
        .single();

      if (existing) {
        console.log(`⏭️  Skipping existing block: ${block.key}`);
        continue;
      }

      // Get current user (founder) for created_by
      const { data: { user } } = await supabase.auth.getUser();

      // Create content block
      const { error } = await supabase
        .from('content_blocks')
        .insert({
          block_key: block.key,
          title: block.title,
          content: block.content,
          rich_content: block.rich_content,
          category: block.category,
          edit_permissions: block.edit_permissions,
          version_history: block.version_history || [{
            version: 1,
            content: block.content,
            rich_content: block.rich_content,
            edited_by: user?.id || 'migration-script',
            edited_at: new Date().toISOString(),
            changes: 'Initial migration from static content'
          }],
          created_by: user?.id || 'migration-script'
        });

      if (error) {
        console.error(`❌ Failed to create content block ${block.key}:`, error);
      } else {
        console.log(`✅ Created content block: ${block.key}`);
      }

    } catch (error) {
      console.error(`❌ Error migrating content block ${block.key}:`, error);
    }
  }
}

/**
 * Update components to use CMS content blocks
 */
async function updateComponentReferences(): Promise<void> {
  console.log('🔄 Updating component references...');

  const updates = [
    {
      file: 'components/layout/Hero.tsx',
      oldText: 'Empowering Environmental STEM Education',
      newKey: 'homepage_hero_title'
    },
    {
      file: 'components/sections/Mission.tsx',
      oldText: 'Our Mission',
      newKey: 'homepage_mission_title'
    }
  ];

  for (const update of updates) {
    try {
      const filePath = path.join(process.cwd(), update.file);

      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf-8');

        // Replace static text with CMS reference
        const cmsReference = `useContentBlock('${update.newKey}')`;
        content = content.replace(
          new RegExp(update.oldText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
          `{${cmsReference}}`
        );

        fs.writeFileSync(filePath, content);
        console.log(`✅ Updated ${update.file} to use CMS content block: ${update.newKey}`);
      }
    } catch (error) {
      console.error(`❌ Failed to update ${update.file}:`, error);
    }
  }
}

/**
 * Create a useContentBlock hook for components
 */
function createContentBlockHook(): void {
  const hookContent = `'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface ContentBlock {
  id: string;
  block_key: string;
  title: string;
  content: string;
  rich_content?: string;
  category: string;
}

/**
 * Hook to fetch content from CMS
 */
export function useContentBlock(key: string, fallback?: string): string {
  const [content, setContent] = useState<string>(fallback || '');
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchContent() {
      try {
        const { data, error } = await supabase
          .from('content_blocks')
          .select('content, rich_content')
          .eq('block_key', key)
          .single();

        if (error) {
          console.warn(\`Content block '\${key}' not found, using fallback\`);
          return;
        }

        // Prefer rich content, fall back to plain content
        setContent(data.rich_content || data.content || fallback || '');
      } catch (error) {
        console.error('Error fetching content block:', error);
        setContent(fallback || '');
      } finally {
        setLoading(false);
      }
    }

    fetchContent();
  }, [key, fallback]);

  return content;
}

/**
 * Hook to fetch multiple content blocks
 */
export function useContentBlocks(keys: string[]): Record<string, string> {
  const [contents, setContents] = useState<Record<string, string>>({});
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchContents() {
      const results: Record<string, string> = {};

      for (const key of keys) {
        try {
          const { data, error } = await supabase
            .from('content_blocks')
            .select('content, rich_content')
            .eq('block_key', key)
            .single();

          if (!error && data) {
            results[key] = data.rich_content || data.content || '';
          }
        } catch (error) {
          console.error(\`Error fetching content block \${key}:\`, error);
        }
      }

      setContents(results);
    }

    fetchContents();
  }, [keys]);

  return contents;
}
`;

  const hookPath = path.join(process.cwd(), 'lib/hooks/useContentBlock.ts');
  fs.writeFileSync(hookPath, hookContent);
  console.log('✅ Created useContentBlock hook');
}

/**
 * Main migration function
 */
async function main(): Promise<void> {
  try {
    console.log('🚀 Starting content migration to CMS...\n');

    // Extract static content from components
    const extractedContent = await extractStaticContent();

    // Combine with predefined content blocks
    const allContentBlocks = [...STATIC_CONTENT_BLOCKS, ...extractedContent];

    // Migrate to database
    await migrateContentBlocks(allContentBlocks);

    // Create content block hook
    createContentBlockHook();

    // Update component references (commented out for safety)
    // await updateComponentReferences();

    console.log('\n🎉 Content migration completed successfully!');
    console.log('📋 Next steps:');
    console.log('   1. Review migrated content in admin/content');
    console.log('   2. Update components to use useContentBlock hook');
    console.log('   3. Test that all content displays correctly');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
main();
