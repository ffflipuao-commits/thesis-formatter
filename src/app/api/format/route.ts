import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { processDocument } from '@/lib/format/engine';
import { mergeTemplateConfig } from '@/lib/format/templates';
import type { TemplateConfig } from '@/types';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const body = await request.json();
  const { document_id, file_path } = body;

  try {
    const { data: doc } = await supabase
      .from('documents').select('*').eq('id', document_id).single();

    let templateConfig: TemplateConfig | null = null;
    if (doc?.template_id) {
      const { data: tmpl } = await supabase
        .from('templates').select('*').eq('id', doc.template_id).single();
      templateConfig = tmpl?.config as TemplateConfig;
    }
    const config = mergeTemplateConfig(templateConfig);

    const { checklist } = await processDocument({
      documentId: document_id,
      filePath: file_path,
      templateConfig: config,
    });

    const allPassed = checklist.every(c => c.status !== 'fail');
    await supabase.from('documents').update({
      status: allPassed ? 'done' : 'error',
      page_count: 0,
    }).eq('id', document_id);

    return NextResponse.json({ checklist, status: allPassed ? 'done' : 'error' });

  } catch (err: any) {
    await supabase.from('documents').update({
      status: 'error',
      error_message: err.message,
    }).eq('id', document_id);

    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
