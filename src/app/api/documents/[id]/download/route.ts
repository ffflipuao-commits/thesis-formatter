import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { canDownloadDocument } from '@/lib/vip';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '请先登录' }, { status: 401 });

  const allowed = await canDownloadDocument(user.id, params.id);
  if (!allowed) {
    return NextResponse.json({ error: '请先付费解锁下载功能' }, { status: 403 });
  }

  const { data: doc } = await supabase
    .from('documents')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (!doc || !doc.processed_file) {
    return NextResponse.json({ error: '文档不存在或未处理完成' }, { status: 404 });
  }

  const { data: fileData, error } = await supabase.storage
    .from('documents')
    .download(doc.processed_file);

  if (error || !fileData) {
    return NextResponse.json({ error: '文件下载失败' }, { status: 500 });
  }

  return new NextResponse(fileData, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="formatted_${doc.original_name}"`,
    },
  });
}
