"use client";

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
          console.warn(`Content block '${key}' not found, using fallback`);
          setContent(fallback || '');
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
          console.error(`Error fetching content block ${key}:`, error);
        }
      }

      setContents(results);
    }

    fetchContents();
  }, [keys]);

  return contents;
}

/**
 * Hook to fetch content block with metadata
 */
export function useContentBlockWithMeta(key: string, fallback?: string) {
  const [data, setData] = useState<{
    content: string;
    title: string;
    category: string;
    loading: boolean;
  }>({
    content: fallback || '',
    title: '',
    category: '',
    loading: true
  });

  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchContent() {
      try {
        const { data: block, error } = await supabase
          .from('content_blocks')
          .select('title, content, rich_content, category')
          .eq('block_key', key)
          .single();

        if (error) {
          console.warn(`Content block '${key}' not found, using fallback`);
          setData({
            content: fallback || '',
            title: '',
            category: '',
            loading: false
          });
          return;
        }

        setData({
          content: block.rich_content || block.content || fallback || '',
          title: block.title || '',
          category: block.category || '',
          loading: false
        });
      } catch (error) {
        console.error('Error fetching content block:', error);
        setData({
          content: fallback || '',
          title: '',
          category: '',
          loading: false
        });
      }
    }

    fetchContent();
  }, [key, fallback]);

  return data;
}
