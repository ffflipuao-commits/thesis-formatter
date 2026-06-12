import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '请先登录' }, { status: 401 });

  const { data: doc, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (error || !doc) return NextResponse.json({ error: '文档不存在' }, { status: 404 });

  // 解析 error_message 中的 JSON 数据（previewHtml + checklist）
  let previewHtml = '';
  let checklist: any[] = [];
  if (doc.error_message) {
    try {
      const parsed = JSON.parse(doc.error_message);
      previewHtml = parsed.previewHtml || '';
      checklist = parsed.checklist || [];
    } catch {}
  }

  return NextResponse.json({
    ...doc,
    previewHtml,
    checklist,
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '请先登录' }, { status: 401 });

  // 删除 Storage 中的文件
  const { data: doc } = await supabase
    .from('documents')
    .select('original_file')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (doc?.original_file) {
    await supabase.storage.from('documents').remove([doc.original_file]);
  }

  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', params.id)
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
