# 毕业论文AI格式工具 — 产品设计文档

> 创建日期：2026-06-12  
> 状态：设计完成，待实施

---

## 一、产品概述

**一句话描述：** 大学生上传Word论文 → AI自动排版 → 免费预览前3页 → 付费下载完整文档。

**目标用户：** 国内高校应届毕业生，需要按学校规范调整论文格式但不想手动排版。

**商业模型：** Freemium + VIP订阅。免费体验吸引用户，付费解锁完整功能。

---

## 二、核心决策汇总

| 决策项 | 选择 |
|--------|------|
| 格式引擎 | 规则引擎（90%）+ AI识别（10%）混合模式 |
| 格式规范 | 多学校模板平台 + 用户自定义微调 |
| 定价模式 | 单次付费 + 订阅并行 |
| 技术栈 | Next.js 全栈（React + Tailwind） |
| 数据库 | Supabase PostgreSQL |
| 部署 | Vercel |

---

## 三、VIP权益体系

| 权益 | 🆓 免费 | 🎫 单次 ¥5.9 | 📅 月卡 ¥15.9 | 👑 年卡 ¥59.9 |
|------|---------|-------------|--------------|-------------|
| 上传处理 | ✅ | ✅ | ✅ | ✅ |
| 预览全文 | 前3页+水印 | 全文无水印 | 全文无水印 | 全文无水印 |
| 下载文档 | ❌ | ✅ 该篇 | ✅ 无限 | ✅ 无限 |
| 全部模板 | 仅通用国标 | ✅ 全部 | ✅ 全部 | ✅ 全部 |
| 自定义微调 | ❌ | ✅ | ✅ | ✅ |
| 专属标识 | - | - | 💎月卡 | 👑年卡 |

**核心理念：** 所有付费用户功能完全一致，仅区分使用次数（1次 vs 无限）和时长（30天 vs 365天）。免费用户可完整体验流程但无法下载。

---

## 四、技术架构

### 4.1 整体分层

```
用户浏览器
    │ HTTPS
    ▼
┌─ Vercel 部署层 ─────────────────────────────────┐
│  Next.js App (SSR + API Routes)                  │
│                                                  │
│  🎨 前端 (React + Tailwind)                      │
│  • /               首页/Landing                  │
│  • /upload         上传+格式处理                 │
│  • /preview/[id]   在线预览                      │
│  • /dashboard      用户中心                      │
│  • /admin          管理后台                      │
│                                                  │
│  ⚙️ API Routes                                   │
│  • /api/auth/*     认证（Supabase Auth）          │
│  • /api/documents  文档CRUD                      │
│  • /api/format     格式处理                      │
│  • /api/payment/*  支付回调                      │
│  • /api/templates  模板管理                      │
└──────────────────────────────────────────────────┘
    │              │              │
    ▼              ▼              ▼
┌─ Supabase ─┐ ┌─ AI API ─┐ ┌─ 支付 ─┐
│ PostgreSQL │ │ Claude/  │ │ 聚合支付│
│ Auth       │ │ GPT      │ │ (PayJS) │
│ Storage    │ │          │ │         │
└────────────┘ └──────────┘ └─────────┘
```

### 4.2 技术选型

| 层 | 技术 | 理由 |
|----|------|------|
| 框架 | Next.js 14 (App Router) | 全栈一体，SSR+API，Vercel原生支持 |
| 前端 | React 18 + Tailwind CSS | 快速构建UI，响应式 |
| 认证 | Supabase Auth | 免费，支持邮箱+OAuth |
| 数据库 | Supabase PostgreSQL | 免费额度500MB，够创业初期 |
| 文件存储 | Supabase Storage | 存原始文档和处理后文档 |
| AI | Claude API / GPT-4o-mini | 智能识别论文结构 |
| Word处理 | python-docx (子进程) + docx.js | 规则引擎主力 |
| 支付 | 虎皮椒/PayJS 聚合支付 | 个人可接入，支持微信支付宝 |
| 部署 | Vercel Hobby | 免费，自动CI/CD |

---

## 五、格式引擎设计

### 5.1 处理清单

| 格式项 | 方式 | 说明 |
|--------|------|------|
| 页面设置 | 规则 | A4纸张，页边距，页眉页脚距离，装订线 |
| 封面&声明页 | 规则+AI | 模板替换 + AI提取标题/姓名/学号 |
| 字体&段落 | 规则 | 正文宋体/标题黑体，字号，行距，段前段后 |
| 标题层级 | AI+规则 | AI识别层级 → 规则统一应用格式 |
| 目录 | 规则+AI | 自动生成目录 + AI验证一致性 |
| 图表编号 | AI+规则 | AI识别图表位置 → 规则按章节编号 |
| 参考文献 | 规则+AI | GB/T 7714格式化 + AI补全缺失字段 |
| 页眉页脚 | 规则+AI | 奇偶页设置 + AI提取章节名为页眉 |

### 5.2 处理流程

```
上传.docx → 解包文档XML结构 → AI一次性识别（章节树+图表+引用）
→ 规则引擎批量应用格式 → 重新打包.docx → 前端渲染预览（前3页/全文）
```

- **处理时间：** 30秒 ~ 2分钟
- **AI成本：** 约 ¥0.1 ~ 0.3 / 篇
- **并发支持：** Next.js API Route 无状态设计，天然支持水平扩展

---

## 六、数据库设计

### 6.1 核心表

**users** — 用户表
```sql
id UUID PK, email TEXT UNIQUE, name TEXT, avatar TEXT,
created_at TIMESTAMP
```

**subscriptions** — 订阅表
```sql
id UUID PK, user_id FK, plan ENUM('once','month','year'),
status ENUM('active','expired','cancelled'),
starts_at TIMESTAMP, ends_at TIMESTAMP, payment_id FK
```

**documents** — 文档表
```sql
id UUID PK, user_id FK, original_name TEXT, template_id FK,
status ENUM('processing','done','error'),
original_file TEXT, processed_file TEXT,
page_count INT, created_at TIMESTAMP
```

**payments** — 支付表
```sql
id UUID PK, user_id FK, amount DECIMAL, plan TEXT,
payment_method TEXT, status TEXT,
transaction_id TEXT, created_at TIMESTAMP
```

**templates** — 模板表
```sql
id UUID PK, school_name TEXT, description TEXT,
config JSONB, is_active BOOL, created_at TIMESTAMP
```

---

## 七、页面结构

### 7.1 路由设计

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | 首页 | 产品介绍 + CTA上传按钮 |
| `/pricing` | 定价页 | 四档对比 + 直接购买 |
| `/upload` | 上传页 | 拖拽上传 + 选择学校模板 |
| `/preview/[id]` | 预览页 | 左右分栏：检查清单 + 文档预览 |
| `/dashboard` | 用户中心 | 文档历史 + 会员状态 |
| `/dashboard/settings` | 账户设置 | 修改资料 |
| `/admin` | 管理后台 | 用户管理、模板管理、订单管理 |

### 7.2 核心交互流程

```
首页 → 上传论文 → 选择学校模板 → 开始处理
→ 预览前3页（免费）/ 全文（VIP）
→ 想下载？→ 弹出支付 → 扫码付款 → 自动解锁下载
```

---

## 八、支付方案

使用第三方聚合支付平台（如 **PayJS** / **虎皮椒**），个人开发者无需企业资质即可接入微信支付和支付宝。

**支付流程：**
1. 用户在前端选择套餐
2. 后端创建订单，调用支付平台API生成支付链接/二维码
3. 用户扫码支付
4. 支付平台异步回调 → 后端验证签名 → 激活会员/解锁文档
5. 前端轮询订单状态 → 支付成功自动跳转下载

---

## 九、部署方案

**Vercel 一键部署：**
- 关联 GitHub 仓库
- 配置环境变量（Supabase URL/Key, AI API Key, 支付密钥）
- 自动部署，自带 HTTPS 和 CDN
- 免费额度：100GB带宽/月，足够初期使用

**自定义域名：** 购买域名 → 在Vercel中绑定 → 自动配置SSL

---

## 十、开发路线图

### Phase 1 — MVP（核心功能） ~2周
- [ ] 项目脚手架（Next.js + Tailwind + Supabase）
- [ ] 用户注册/登录
- [ ] Word上传 + 规则引擎格式处理
- [ ] 在线预览（前3页免费）
- [ ] 通用国标模板

### Phase 2 — 付费闭环 ~1周
- [ ] 支付集成（PayJS）
- [ ] VIP权益控制（下载权限）
- [ ] 定价页面
- [ ] 用户中心（文档历史 + 会员状态）

### Phase 3 — 多模板 + AI ~1周
- [ ] 多学校模板系统
- [ ] AI智能识别模块
- [ ] 自定义微调功能
- [ ] 参考文献GB/T 7714格式化

### Phase 4 — 上线优化 ~1周
- [ ] 管理后台
- [ ] 性能优化
- [ ] 错误处理 & 监控
- [ ] SEO & 落地页优化
- [ ] 自定义域名 & 正式上线

---

## 十一、成本估算

| 项目 | 月成本（初期） |
|------|--------------|
| Vercel托管 | ¥0（免费额度内） |
| Supabase | ¥0（免费额度内） |
| AI API | ¥50~200（按500篇/月估算） |
| 支付手续费 | 1%~2%交易额 |
| 域名 | ¥50~100/年 |
| **合计** | **约 ¥100~300/月** |

---

## 十二、风险与对策

| 风险 | 对策 |
|------|------|
| AI识别不稳定 | 降级到纯规则模式，AI仅做建议 |
| Word格式复杂多样 | 先支持标准.docx，逐步覆盖边界情况 |
| 支付合规 | 使用持牌聚合支付平台，不直接处理资金 |
| 竞争产品 | 多模板 + 价格优势（学生价）建立壁垒 |
| Vercel被墙 | 备选方案：阿里云/腾讯云部署 |
