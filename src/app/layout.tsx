import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: '论文格式助手 - AI智能排版，一键搞定毕业论文格式',
  description: '上传Word文档，AI自动按学校规范调整论文格式。支持20+高校模板，GB/T 7714参考文献，图表自动编号。免费预览，满意付费。',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Toaster position="top-center" />
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
