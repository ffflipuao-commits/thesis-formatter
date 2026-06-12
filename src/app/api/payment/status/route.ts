import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '请先登录' }, { status: 401 });

  const paymentId = request.nextUrl.searchParams.get('id');
  if (!paymentId) return NextResponse.json({ error: '缺少paymentId' }, { status: 400 });

  const { data: payment } = await supabase
    .from('payments')
    .select('*')
    .eq('id', paymentId)
    .eq('user_id', user.id)
    .single();

  return NextResponse.json({ status: payment?.status || 'unknown' });
}
