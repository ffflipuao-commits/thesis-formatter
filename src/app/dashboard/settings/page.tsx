'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return; }
      setEmail(user.email || '');
      setName(user.user_metadata?.name || '');
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ data: { name } });
      if (error) throw error;
      toast.success('保存成功');
    } catch (err: any) {
      toast.error(err.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400">加载中...</div>;
  }

  return (
    <div className="max-w-md">
      <h2 className="text-xl font-bold mb-6">⚙️ 账户设置</h2>
      <form onSubmit={handleSave} className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
          <input type="email" value={email} disabled className="input-field bg-gray-50 text-gray-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="input-field"
            placeholder="你的姓名"
          />
        </div>
        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? '保存中...' : '保存设置'}
        </button>
      </form>
    </div>
  );
}
