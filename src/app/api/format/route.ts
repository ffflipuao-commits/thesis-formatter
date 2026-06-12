import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { processDocument } from '@/lib/format/engine';
import { mergeTemplateConfig } from '@/lib/format/templates';
import type { TemplateConfig } from '@/types';

// POST /api/format — 由浏览器端触发（带cookie auth）
// 下载原始文件 → 引擎处理 → 上传格式化结果和预览HTML
export async function POST(request: NextRequest) {
  const supabase = createClient();

  // 认证
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '请先登录' }, { status: 401 });

  const body = await request.json();
  const { document_id } = body;

  try {
    // 1. 获取文档记录，验证所有权
    const { data: doc, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', document_id)
      .eq('user_id', user.id)
      .single();

    if (docError || !doc) {
      return NextResponse.json({ error: '文档不存在' }, { status: 404 });
    }

    if (doc.status === 'done') {
      return NextResponse.json({ status: 'done', message: '文档已处理完成' });
    }

    // 2. 获取模板配置
    let templateConfig: TemplateConfig | null = null;
    if (doc.template_id) {
      const { data: tmpl } = await supabase
        .from('templates')
        .select('*')
        .eq('id', doc.template_id)
        .single();
      templateConfig = tmpl?.config as TemplateConfig;
    }
    const config = mergeTemplateConfig(templateConfig);

    // 3. 下载原始文件
    const { data: fileBlob, error: downloadError } = await supabase.storage
      .from('documents')
      .download(doc.original_file);

    if (downloadError || !fileBlob) {
      throw new Error(`文件下载失败: ${downloadError?.message || '未知错误'}`);
    }

    const fileBuffer = await fileBlob.arrayBuffer();

    // 4. 执行格式处理
    const result = await processDocument({
      documentId: document_id,
      fileBuffer,
      templateConfig: config,
    });

    // 5. 更新文档状态（存储 preview HTML 和检查清单到 metadata 字段）
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        status: result.checklist.some(c => c.status === 'fail') ? 'done' : 'done',
        page_count: result.pageCount,
        error_message: JSON.stringify({
          checklist: result.checklist,
          previewHtml: result.previewHtml,
        }),
      })
      .eq('id', document_id);

    if (updateError) {
      console.error('更新文档状态失败:', updateError);
    }

    return NextResponse.json({
      status: 'done',
      checklist: result.checklist,
      previewHtml: result.previewHtml,
      pageCount: result.pageCount,
    });

  } catch (err: any) {
    // 更新文档为错误状态
    await supabase
      .from('documents')
      .update({
        status: 'error',
        error_message: err.message,
      })
      .eq('id', document_id);

    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
