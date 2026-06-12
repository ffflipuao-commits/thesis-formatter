import Link from 'next/link';

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-accent-50 py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-5xl font-bold mb-4">
            毕业论文格式，<span className="text-primary">一键搞定</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            上传Word文档 → AI智能识别排版 → 自动匹配学校模板 → 下载规范论文。
            支持20+高校模板，GB/T 7714参考文献，图表自动编号。
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/upload" className="btn-primary text-lg px-8 py-4">
              📤 上传论文，免费试用
            </Link>
            <Link href="/pricing" className="btn-outline text-lg px-8 py-4">
              查看定价
            </Link>
          </div>
          <p className="text-sm text-gray-400 mt-4">免费预览前3页，满意再付费 · 单次仅需 ¥5.9</p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">为什么选择我们？</h2>
        <div className="grid grid-cols-3 gap-8">
          {[
            { icon: '🤖', title: 'AI智能排版', desc: '自动识别标题层级、图表编号、参考文献，无需手动调整' },
            { icon: '🏫', title: '多校模板', desc: '内置多所高校官方论文模板，一键匹配学校要求' },
            { icon: '📋', title: 'GB/T 7714', desc: '参考文献自动格式化为国标格式，支持期刊/图书/论文等类型' },
            { icon: '⚡', title: '快速处理', desc: '30秒~2分钟完成一篇论文的格式调整' },
            { icon: '💎', title: '学生价', desc: '单次¥5.9，月卡¥15.9，年卡¥59.9，人人都用得起' },
            { icon: '🔒', title: '隐私安全', desc: '文档加密存储，处理后自动删除，保护你的论文安全' },
          ].map((f, i) => (
            <div key={i} className="text-center p-6">
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-white py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">准备好让你的论文变规范了吗？</h2>
        <p className="text-primary-100 mb-8">免费体验，无任何门槛</p>
        <Link href="/upload" className="inline-block bg-white text-primary text-lg font-bold px-10 py-4 rounded-xl hover:bg-gray-100 transition-colors">
          🚀 立即开始
        </Link>
      </section>
    </div>
  );
}
