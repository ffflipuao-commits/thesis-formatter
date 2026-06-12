'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PricingCard } from '@/components/PricingCard';
import { PaymentModal } from '@/components/PaymentModal';
import { createClient } from '@/lib/supabase/client';
import type { PlanType } from '@/types';
import toast from 'react-hot-toast';

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSelect = async (plan: PlanType) => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) {
      toast.error('请先登录');
      router.push('/auth/login?redirect=/pricing');
      return;
    }
    setSelectedPlan(plan);
  };

  const plans = [
    {
      plan: 'once' as PlanType,
      name: '🎫 单次处理',
      price: 5.9,
      features: ['处理1篇论文', '所有学校模板', '自定义微调', '无水印下载', '永久有效'],
    },
    {
      plan: 'month' as PlanType,
      name: '📅 月卡',
      price: 15.9,
      originalPrice: 19.9,
      features: ['30天无限次处理', '所有学校模板', '自定义微调', '无水印下载', '💎 VIP标识'],
      highlighted: true,
    },
    {
      plan: 'year' as PlanType,
      name: '👑 年卡',
      price: 59.9,
      originalPrice: 79.9,
      features: ['365天无限次处理', '所有学校模板', '自定义微调', '无水印下载', '👑 年费标识', '优先支持'],
    },
  ];

  return (
    <div className="max-w-5xl mx-auto py-16 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-3">简单透明的定价</h1>
        <p className="text-gray-500 text-lg">免费体验，满意再付费。学生价，良心价。</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {plans.map(p => (
          <PricingCard key={p.plan} {...p} onSelect={handleSelect} />
        ))}
      </div>

      <div className="text-center mt-8 text-sm text-gray-400">
        支持微信支付 · 支付宝 · 随时可退 · 自动续费可关闭
      </div>

      {selectedPlan && (
        <PaymentModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onSuccess={() => { setSelectedPlan(null); router.push('/dashboard'); router.refresh(); }}
        />
      )}
    </div>
  );
}
