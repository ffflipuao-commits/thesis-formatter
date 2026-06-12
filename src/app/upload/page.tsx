'use client';

import { useState } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { FileDropzone } from '@/components/FileDropzone';
import { TemplateSelector } from '@/components/TemplateSelector';

export default function UploadPage() {
  const [templateId, setTemplateId] = useState('');

  return (
    <AuthGuard>
      <div className="max-w-2xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-center mb-2">上传论文</h1>
        <p className="text-gray-500 text-center mb-8">选择学校模板，上传Word文档，AI自动排版</p>

        <div className="space-y-6">
          <TemplateSelector selected={templateId} onSelect={setTemplateId} />
          <FileDropzone templateId={templateId} />
        </div>
      </div>
    </AuthGuard>
  );
}
