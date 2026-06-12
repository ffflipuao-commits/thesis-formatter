'use client';

import { useEffect, useState } from 'react';
import type { Template } from '@/types';

interface TemplateSelectorProps {
  selected: string;
  onSelect: (id: string) => void;
}

export function TemplateSelector({ selected, onSelect }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/templates')
      .then(r => r.json())
      .then(data => { setTemplates(data.templates || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-sm text-gray-500">加载模板列表...</div>;
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">选择学校模板</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {templates.map(t => (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className={`p-3 border rounded-lg text-left transition-all
              ${selected === t.id
                ? 'border-primary bg-primary-50 ring-2 ring-primary'
                : 'border-gray-200 hover:border-gray-300'}`}
          >
            <div className="font-medium text-sm">{t.school_name}</div>
            <div className="text-xs text-gray-500 mt-1">{t.description}</div>
            {t.is_premium && (
              <span className="inline-block mt-1 text-xs bg-accent-100 text-accent-600 px-2 py-0.5 rounded">高级模板</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
