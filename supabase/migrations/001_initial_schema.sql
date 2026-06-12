-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 用户资料表（扩展 Supabase auth.users）
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 自动创建 profile 的触发器
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'avatar'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 模板表
CREATE TABLE public.templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_name TEXT NOT NULL,
  description TEXT DEFAULT '',
  config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 文档表
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  original_name TEXT NOT NULL,
  template_id UUID REFERENCES public.templates(id),
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing','done','error')),
  original_file TEXT NOT NULL,
  processed_file TEXT,
  page_count INT DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 支付表
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  amount DECIMAL(10,2) NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('once','month','year')),
  payment_method TEXT DEFAULT 'wechat',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','refunded')),
  transaction_id TEXT,
  payjs_order_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 订阅表
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  plan TEXT NOT NULL CHECK (plan IN ('once','month','year')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active','expired','cancelled')),
  starts_at TIMESTAMPTZ DEFAULT now(),
  ends_at TIMESTAMPTZ,
  payment_id UUID REFERENCES public.payments(id),
  document_id UUID REFERENCES public.documents(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Profiles: 用户可读自己的
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Documents: 用户CRUD自己的文档
CREATE POLICY "Users can read own documents" ON public.documents
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own documents" ON public.documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own documents" ON public.documents
  FOR DELETE USING (auth.uid() = user_id);

-- Payments: 用户可读自己的
CREATE POLICY "Users can read own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

-- Subscriptions: 用户可读自己的
CREATE POLICY "Users can read own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Templates: 所有人可读
CREATE POLICY "Anyone can read active templates" ON public.templates
  FOR SELECT USING (is_active = true);

-- Storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

CREATE POLICY "Users can read own files" ON storage.objects
  FOR SELECT USING (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own files" ON storage.objects
  FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);

-- 插入默认模板数据
INSERT INTO public.templates (school_name, description, config, is_premium) VALUES
(
  '通用国标模板',
  '适用于大多数高校的通用毕业论文格式，符合GB/T 7714标准',
  '{
    "page": {"width": 210, "height": 297, "marginTop": 25.4, "marginBottom": 25.4, "marginLeft": 31.8, "marginRight": 31.8, "headerDistance": 15, "footerDistance": 15},
    "font": {"body": "宋体", "bodySize": 12, "heading": "黑体", "headingSizes": {"h1": 16, "h2": 14, "h3": 12}, "lineSpacing": 1.5},
    "cover": {"enabled": true, "fields": ["title","author","studentId","school","major","advisor","date"]},
    "header": {"oddPages": "学校名称", "evenPages": "论文题目"},
    "reference": {"style": "gb7714"}
  }'::jsonb,
  false
);
