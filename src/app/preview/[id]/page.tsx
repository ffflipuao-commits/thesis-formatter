'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { AuthGuard } from '@/components/AuthGuard';
import { PreviewClient } from './PreviewClient';

export default function PreviewPageWrapper() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/documents/${id}`)
      .then(r => r.json())
      .then(doc => {
        if (doc.error) {
          setData({ error: true });
        } else {
          setData(doc);
        }
      })
      .catch(() => setData({ error: true }))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <AuthGuard>
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-500">加载文档...</p>
        </div>
      ) : data?.error ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-4">📄</div>
          <p className="text-gray-500">文档不存在或无权访问</p>
        </div>
      ) : (
        <PreviewClient
          documentId={data?.id || id}
          documentName={data?.original_name || '文档'}
          status={data?.status || 'processing'}
          isVip={false}
          canPreviewFull={false}
        />
      )}
    </AuthGuard>
  );
}
