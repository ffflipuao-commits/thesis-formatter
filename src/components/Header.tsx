'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
    router.refresh();
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          🎓 论文格式助手
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/#features" className="text-gray-600 hover:text-primary">功能</Link>
          <Link href="/pricing" className="text-gray-600 hover:text-primary">定价</Link>
          {!loading && (
            user ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard" className="text-gray-600 hover:text-primary">我的文档</Link>
                <span className="text-gray-400">|</span>
                <button onClick={handleLogout} className="text-gray-500 hover:text-danger text-sm">退出</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login" className="btn-outline text-sm py-1.5 px-4">登录</Link>
                <Link href="/auth/register" className="btn-primary text-sm py-1.5 px-4">注册</Link>
              </div>
            )
          )}
        </nav>
      </div>
    </header>
  );
}
