'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface FileDropzoneProps {
  templateId: string;
}

export function FileDropzone({ templateId }: FileDropzoneProps) {
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    if (!file.name.endsWith('.docx')) {
      toast.error('仅支持 .docx 格式的Word文档');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error('文件大小不能超过 20MB');
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('请先登录');

      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          original_name: file.name,
          file_path: filePath,
          template_id: templateId,
        }),
      });

      const doc = await res.json();
      if (!res.ok) throw new Error(doc.error || '创建文档失败');

      toast.success('上传成功，正在处理格式...');
      router.push(`/preview/${doc.id}`);
    } catch (err: any) {
      toast.error(err.message || '上传失败');
    } finally {
      setUploading(false);
    }
  }, [templateId, router, supabase]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-primary bg-primary-50' : 'border-gray-300 hover:border-primary'}
        ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input {...getInputProps()} />
      <div className="text-5xl mb-4">📤</div>
      {uploading ? (
        <div>
          <p className="text-lg font-semibold text-gray-700">上传中...</p>
          <p className="text-sm text-gray-500 mt-1">请稍候</p>
        </div>
      ) : isDragActive ? (
        <p className="text-lg font-semibold text-primary">松开以开始上传</p>
      ) : (
        <div>
          <p className="text-lg font-semibold text-gray-700">拖拽 .docx 文件到此处</p>
          <p className="text-sm text-gray-500 mt-1">或点击选择文件，最大 20MB</p>
        </div>
      )}
    </div>
  );
}
