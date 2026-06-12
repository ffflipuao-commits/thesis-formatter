export type PlanType = 'once' | 'month' | 'year';
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled';
export type DocumentStatus = 'processing' | 'done' | 'error';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: PlanType;
  status: SubscriptionStatus;
  starts_at: string;
  ends_at: string | null;
  payment_id: string;
}

export interface Document {
  id: string;
  user_id: string;
  original_name: string;
  template_id: string | null;
  status: DocumentStatus;
  original_file: string;
  processed_file: string | null;
  page_count: number;
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  amount: number;
  plan: PlanType;
  payment_method: string;
  status: PaymentStatus;
  transaction_id: string | null;
  created_at: string;
}

export interface Template {
  id: string;
  school_name: string;
  description: string;
  config: TemplateConfig;
  is_active: boolean;
  is_premium: boolean;
}

export interface TemplateConfig {
  page: {
    width: number;
    height: number;
    marginTop: number;
    marginBottom: number;
    marginLeft: number;
    marginRight: number;
    headerDistance: number;
    footerDistance: number;
  };
  font: {
    body: string;
    bodySize: number;
    heading: string;
    headingSizes: { h1: number; h2: number; h3: number };
    lineSpacing: number;
  };
  cover: {
    enabled: boolean;
    schoolLogo?: string;
    fields: string[];
  };
  header: {
    oddPages: string;
    evenPages: string;
  };
  reference: {
    style: 'gb7714' | 'apa' | 'mla';
  };
}

export interface FormatResult {
  documentId: string;
  status: DocumentStatus;
  checklist: FormatCheckItem[];
  previewHtml?: string;
  error?: string;
}

export interface FormatCheckItem {
  name: string;
  status: 'pending' | 'pass' | 'fail' | 'skip';
  message?: string;
}

export interface VipPermissions {
  canPreviewFull: boolean;
  canDownload: boolean;
  canUseAllTemplates: boolean;
  canCustomAdjust: boolean;
  plan: PlanType | null;
  isVip: boolean;
}
