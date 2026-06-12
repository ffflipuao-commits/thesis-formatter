'use client';
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    // Don't throw during SSR/build — only warn at runtime
    if (typeof window !== 'undefined') {
      console.error('Supabase 环境变量未配置。请在 Vercel 项目设置中添加 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY。');
    }
    // Return a dummy client that will fail gracefully at call time
    return createBrowserClient(url || 'https://placeholder.supabase.co', key || 'placeholder-key');
  }
  return createBrowserClient(url, key);
}
