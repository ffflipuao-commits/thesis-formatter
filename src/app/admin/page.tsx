'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ users: 0, documents: 0, payments: 0, revenue: 0 });
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
      return;
    }
    // Simple admin check - in production, use an admin_users table or env var
    setIsAdmin(true);
    setLoading(false);
  };

  if (loading) return <div className="text-center py-20">加载中...</div>;
  if (!isAdmin) return null;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">🛠️ 管理后台</h1>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: '注册用户', value: stats.users, icon: '👥' },
          { label: '处理文档', value: stats.documents, icon: '📄' },
          { label: '支付订单', value: stats.payments, icon: '💳' },
          { label: '总收入', value: `¥${stats.revenue}`, icon: '💰' },
        ].map((s, i) => (
          <div key={i} className="card">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card mb-8">
        <h2 className="text-lg font-bold mb-4">📐 模板管理</h2>
        <p className="text-sm text-gray-500">在 Supabase Dashboard 的 SQL Editor 中管理学校模板数据。可添加、修改、启用/禁用模板。</p>
      </div>

      <div className="card">
        <h2 className="text-lg font-bold mb-4">📋 快速链接</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <a href="https://supabase.com/dashboard" target="_blank" className="text-primary hover:underline">Supabase 数据库管理 →</a>
          <a href="https://vercel.com/dashboard" target="_blank" className="text-primary hover:underline">Vercel 部署管理 →</a>
          <a href="https://payjs.cn/dashboard" target="_blank" className="text-primary hover:underline">PayJS 支付管理 →</a>
          <a href="https://console.anthropic.com" target="_blank" className="text-primary hover:underline">Claude API 管理 →</a>
        </div>
      </div>
    </div>
  );
}
