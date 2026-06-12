'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Document } from '@/types';

export function DocumentList() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/documents')
      .then(r => r.json())
      .then(data => setDocs(data.documents || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除这个文档？')) return;
    await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    setDocs(docs.filter(d => d.id !== id));
  };

  if (loading) return <div className="text-gray-400 text-sm">加载中...</div>;
  if (docs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-3">📄</div>
        <p className="text-gray-500">还没有处理过论文</p>
        <Link href="/upload" className="btn-primary inline-block mt-4 text-sm">上传第一篇论文</Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {docs.map(doc => (
        <div key={doc.id} className="card flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{doc.original_name}</div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-gray-400">{new Date(doc.created_at).toLocaleDateString('zh-CN')}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                doc.status === 'done' ? 'bg-green-100 text-green-700' :
                doc.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {doc.status === 'done' ? '已完成' : doc.status === 'processing' ? '处理中' : '失败'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Link href={`/preview/${doc.id}`} className="text-sm text-primary hover:underline">预览</Link>
            <button onClick={() => handleDelete(doc.id)} className="text-sm text-gray-400 hover:text-danger">删除</button>
          </div>
        </div>
      ))}
    </div>
  );
}
