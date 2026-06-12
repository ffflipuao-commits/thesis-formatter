'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface AuthFormProps {
  mode: 'login' | 'register';
}

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
            emailRedirectTo: `${location.origin}/auth/callback`,
          },
        });
        if (error) throw error;

        // 检查是否需要邮箱确认
        if (data?.session) {
          toast.success('注册成功，正在跳转...');
          window.location.href = '/upload';
        } else {
          toast.success('注册成功！请检查邮箱并点击确认链接，然后返回登录。', { duration: 8000 });
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        if (data?.session) {
          toast.success('登录成功，正在跳转...');
          // 用 window.location 做硬跳转，确保 cookie 被正确发送
          window.location.href = '/upload';
        } else {
          toast.error('登录状态异常，请重试');
        }
      }
    } catch (err: any) {
      toast.error(err.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === 'register' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="input-field"
            placeholder="你的姓名"
            required={mode === 'register'}
          />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="input-field"
          placeholder="your@email.com"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="input-field"
          placeholder="至少6位"
          minLength={6}
          required
        />
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? '处理中...' : mode === 'login' ? '登录' : '注册'}
      </button>
    </form>
  );
}
