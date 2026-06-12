import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createPayOrder, generateOutTradeNo } from '@/lib/payment/payjs';
import type { PlanType } from '@/types';

const PLAN_PRICES: Record<PlanType, { amount: number; label: string }> = {
  once:  { amount: 590,  label: '单次格式处理' },
  month: { amount: 1590, label: '月度VIP会员' },
  year:  { amount: 5990, label: '年度VIP会员' },
};

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '请先登录' }, { status: 401 });

  const body = await request.json();
  const { plan, documentId } = body as { plan: PlanType; documentId?: string };

  if (!PLAN_PRICES[plan]) {
    return NextResponse.json({ error: '无效的套餐' }, { status: 400 });
  }

  const { amount, label } = PLAN_PRICES[plan];
  const outTradeNo = generateOutTradeNo();

  const { data: payment, error: dbError } = await supabase
    .from('payments')
    .insert({
      user_id: user.id,
      amount: amount / 100,
      plan,
      payment_method: 'wechat',
      status: 'pending',
    })
    .select('*')
    .single();

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

  try {
    const result = await createPayOrder({
      totalFee: amount,
      outTradeNo,
      body: `论文格式助手 - ${label}`,
      attach: JSON.stringify({ payment_id: payment.id, document_id: documentId || '' }),
    });

    if (result.return_code !== 1) {
      return NextResponse.json({ error: result.return_msg }, { status: 500 });
    }

    await supabase.from('payments').update({
      payjs_order_id: result.payjs_order_id,
    }).eq('id', payment.id);

    return NextResponse.json({
      paymentId: payment.id,
      qrcode: result.qrcode,
      codeUrl: result.code_url,
      amount: amount / 100,
      plan,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
