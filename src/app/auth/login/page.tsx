import Link from 'next/link';
import { AuthForm } from '@/components/AuthForm';

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto mt-20 px-4">
      <div className="card">
        <h1 className="text-2xl font-bold text-center mb-6">登录</h1>
        <AuthForm mode="login" />
        <p className="text-center text-sm text-gray-500 mt-4">
          还没有账号？<Link href="/auth/register" className="text-primary hover:underline">立即注册</Link>
        </p>
      </div>
    </div>
  );
}
