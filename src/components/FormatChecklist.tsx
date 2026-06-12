import type { FormatCheckItem } from '@/types';

interface FormatChecklistProps {
  items: FormatCheckItem[];
}

export function FormatChecklist({ items }: FormatChecklistProps) {
  return (
    <div className="card">
      <h3 className="font-bold text-lg mb-3">📋 格式检查项</h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            {item.status === 'pass' && <span className="text-success">✓</span>}
            {item.status === 'fail' && <span className="text-danger">✗</span>}
            {item.status === 'pending' && <span className="text-accent animate-pulse">⏳</span>}
            {item.status === 'skip' && <span className="text-gray-400">○</span>}
            <span className={item.status === 'fail' ? 'text-danger' : 'text-gray-700'}>
              {item.name}
            </span>
            {item.message && <span className="text-xs text-gray-400 ml-auto">{item.message}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
