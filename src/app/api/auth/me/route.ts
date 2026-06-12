import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ authenticated: false, error: error?.message }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    email: user.email,
    id: user.id,
    createdAt: user.created_at,
  });
}
