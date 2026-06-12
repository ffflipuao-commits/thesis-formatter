import Link from 'next/link';
import { AuthForm } from '@/components/AuthForm';

export default function RegisterPage() {
  return (
    <div className="max-w-md mx-auto mt-20 px-4">
      <div className="card">
        <h1 className="text-2xl font-bold text-center mb-6">注册</h1>
        <AuthForm mode="register" />
        <p className="text-center text-sm text-gray-500 mt-4">
          已有账号？<Link href="/auth/login" className="text-primary hover:underline">去登录</Link>
        </p>
      </div>
    </div>
  );
}
