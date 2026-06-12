'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Subscription } from '@/types';

export function SubscriptionCard() {
  const [sub, setSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/user/subscription')
      .then(r => r.json())
      .then(data => setSub(data.subscription || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="card animate-pulse h-32" />;

  const planLabels: Record<string, string> = {
    once: '🎫 单次购买',
    month: '💎 月卡会员',
    year: '👑 年卡会员',
  };

  if (!sub || sub.status !== 'active') {
    return (
      <div className="card text-center">
        <p className="text-gray-500 text-sm mb-3">还不是VIP会员</p>
        <button onClick={() => router.push('/pricing')} className="btn-accent text-sm py-2 px-6">
          💎 立即开通
        </button>
      </div>
    );
  }

  const remaining = sub.ends_at
    ? Math.max(0, Math.ceil((new Date(sub.ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="card bg-gradient-to-br from-accent-50 to-yellow-50 border-accent">
      <div className="text-lg font-bold">{planLabels[sub.plan] || 'VIP'}</div>
      <div className="text-sm text-gray-600 mt-1">
        {sub.plan === 'once' ? '单次处理权限' : `剩余 ${remaining} 天`}
      </div>
      {sub.plan !== 'once' && (
        <button onClick={() => router.push('/pricing')} className="text-sm text-accent-600 hover:underline mt-2">
          续费 / 升级
        </button>
      )}
    </div>
  );
}
