import { DocumentList } from '@/components/DocumentList';
import { SubscriptionCard } from '@/components/SubscriptionCard';

export default function DashboardPage() {
  return (
    <div className="flex gap-8">
      <div className="flex-1">
        <h2 className="text-xl font-bold mb-4">📋 处理历史</h2>
        <DocumentList />
      </div>
      <aside className="w-72 flex-shrink-0">
        <h2 className="text-xl font-bold mb-4">💎 会员状态</h2>
        <SubscriptionCard />
      </aside>
    </div>
  );
}
