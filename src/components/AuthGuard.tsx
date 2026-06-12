'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      if (!currentUser) {
        // 未登录，跳转到登录页
        const loginUrl = `/auth/login?redirect=${encodeURIComponent(pathname)}`;
        router.replace(loginUrl);
      } else {
        setUser(currentUser);
      }
    });
  }, [pathname]);

  // 检查中 - 显示加载
  if (user === undefined) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-500">验证登录状态...</p>
        </div>
      </div>
    );
  }

  // 已登录
  return <>{children}</>;
}
