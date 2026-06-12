'use client';

import { AuthGuard } from '@/components/AuthGuard';

export default function AdminPage() {
  return (
    <AuthGuard>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">🛠️ 管理后台</h1>

        <div className="card mb-8">
          <h2 className="text-lg font-bold mb-4">📐 模板管理</h2>
          <p className="text-sm text-gray-500">在 Supabase Dashboard 的 SQL Editor 中管理学校模板数据。可添加、修改、启用/禁用模板。</p>
        </div>

        <div className="card">
          <h2 className="text-lg font-bold mb-4">📋 快速链接</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-primary hover:underline">Supabase 数据库管理 →</a>
            <a href="https://vercel.com/dashboard" target="_blank" rel="noreferrer" className="text-primary hover:underline">Vercel 部署管理 →</a>
            <a href="https://payjs.cn/dashboard" target="_blank" rel="noreferrer" className="text-primary hover:underline">PayJS 支付管理 →</a>
            <a href="https://console.anthropic.com" target="_blank" rel="noreferrer" className="text-primary hover:underline">Claude API 管理 →</a>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
