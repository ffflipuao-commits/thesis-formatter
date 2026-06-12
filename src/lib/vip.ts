import { createClient } from '@/lib/supabase/server';
import type { VipPermissions, PlanType } from '@/types';

export async function getUserVipPermissions(userId: string): Promise<VipPermissions> {
  const supabase = createClient();

  const { data: subs } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  let bestPlan: PlanType | null = null;
  let hasUnlimited = false;

  for (const sub of (subs || [])) {
    if (sub.plan === 'once') {
      if (!sub.document_id) {
        bestPlan = 'once';
        break;
      }
    } else if (sub.plan === 'year') {
      bestPlan = 'year';
      hasUnlimited = true;
      break;
    } else if (sub.plan === 'month') {
      bestPlan = 'month';
      hasUnlimited = true;
      break;
    }
  }

  if (!bestPlan) {
    return {
      canPreviewFull: false, canDownload: false,
      canUseAllTemplates: false, canCustomAdjust: false,
      plan: null, isVip: false,
    };
  }

  return {
    canPreviewFull: true,
    canDownload: true,
    canUseAllTemplates: true,
    canCustomAdjust: true,
    plan: bestPlan,
    isVip: true,
  };
}

export async function canDownloadDocument(userId: string, documentId: string): Promise<boolean> {
  const supabase = createClient();

  const { data: subs } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .in('plan', ['month', 'year']);

  if (subs && subs.length > 0) return true;

  const { data: onceSub } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .eq('plan', 'once')
    .eq('document_id', documentId)
    .single();

  return !!onceSub;
}
