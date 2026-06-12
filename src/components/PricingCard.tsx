'use client';

import type { PlanType } from '@/types';

interface PricingCardProps {
  plan: PlanType;
  name: string;
  price: number;
  originalPrice?: number;
  features: string[];
  highlighted?: boolean;
  onSelect: (plan: PlanType) => void;
  loading?: boolean;
}

export function PricingCard({ plan, name, price, originalPrice, features, highlighted, onSelect, loading }: PricingCardProps) {
  return (
    <div className={`card relative ${highlighted ? 'ring-2 ring-accent border-accent' : ''}`}>
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-xs px-4 py-1 rounded-full font-medium">
          推荐
        </div>
      )}
      <h3 className="text-lg font-bold">{name}</h3>
      <div className="mt-3 mb-4">
        <span className="text-3xl font-bold">¥{price}</span>
        {plan !== 'once' && <span className="text-gray-500 text-sm">/{plan === 'month' ? '月' : '年'}</span>}
        {plan === 'once' && <span className="text-gray-500 text-sm">/篇</span>}
        {originalPrice && <span className="text-gray-400 line-through text-sm ml-2">¥{originalPrice}</span>}
      </div>
      <ul className="space-y-2 mb-6">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span className="text-success mt-0.5">✓</span>
            <span className="text-gray-600">{f}</span>
          </li>
        ))}
      </ul>
      <button
        onClick={() => onSelect(plan)}
        disabled={loading}
        className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-colors
          ${highlighted ? 'bg-accent text-white hover:bg-accent-600' : 'btn-outline'}`}
      >
        {loading ? '处理中...' : plan === 'once' ? '立即购买' : '订阅'}
      </button>
    </div>
  );
}
