import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { verifyPaySign } from '@/lib/payment/payjs';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const params: Record<string, any> = {};
  body.split('&').forEach(pair => {
    const [k, v] = pair.split('=');
    params[decodeURIComponent(k)] = decodeURIComponent(v || '');
  });

  if (!verifyPaySign(params)) {
    return NextResponse.json({ error: '签名验证失败' }, { status: 400 });
  }

  if (params.return_code !== '1') {
    return new Response('fail');
  }

  const supabase = createServiceClient();
  let attach: any = {};
  try { attach = JSON.parse(params.attach || '{}'); } catch {}

  const { error: payError } = await supabase
    .from('payments')
    .update({ status: 'paid', transaction_id: params.transaction_id })
    .eq('id', attach.payment_id);

  if (payError) return new Response('fail');

  const { data: payment } = await supabase
    .from('payments').select('*').eq('id', attach.payment_id).single();

  if (!payment) return new Response('fail');

  const now = new Date();
  let endsAt: Date | null = null;
  if (payment.plan === 'month') {
    endsAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  } else if (payment.plan === 'year') {
    endsAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
  }

  await supabase.from('subscriptions').insert({
    user_id: payment.user_id,
    plan: payment.plan,
    status: 'active',
    starts_at: now.toISOString(),
    ends_at: endsAt?.toISOString() || null,
    payment_id: payment.id,
    document_id: attach.document_id || null,
  });

  return new Response('success');
}
