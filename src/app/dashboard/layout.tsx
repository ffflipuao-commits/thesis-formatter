import { AuthGuard } from '@/components/AuthGuard';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="flex gap-3 mb-8 border-b border-gray-200 pb-4">
          <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-primary px-3 py-1">
            📋 我的文档
          </Link>
          <Link href="/dashboard/settings" className="text-sm font-medium text-gray-600 hover:text-primary px-3 py-1">
            ⚙️ 账户设置
          </Link>
        </div>
        {children}
      </div>
    </AuthGuard>
  );
}
