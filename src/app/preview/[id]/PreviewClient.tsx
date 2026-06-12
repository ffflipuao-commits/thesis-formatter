'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FormatChecklist } from '@/components/FormatChecklist';
import { DocumentPreview } from '@/components/DocumentPreview';
import { PaymentModal } from '@/components/PaymentModal';
import type { FormatCheckItem } from '@/types';

interface PreviewClientProps {
  documentId: string;
  documentName: string;
  status: string;
  isVip: boolean;
  canPreviewFull: boolean;
}

export function PreviewClient({ documentId, documentName, status: initialStatus, isVip, canPreviewFull }: PreviewClientProps) {
  const [checklist, setChecklist] = useState<FormatCheckItem[]>([]);
  const [previewHtml, setPreviewHtml] = useState('');
  const [docStatus, setDocStatus] = useState(initialStatus);
  const [showPayment, setShowPayment] = useState(false);
  const router = useRouter();

  const pollStatus = useCallback(async () => {
    const res = await fetch(`/api/documents/${documentId}`);
    const data = await res.json();
    setDocStatus(data.status);
    if (data.status === 'done') {
      const previewRes = await fetch(`/api/documents/${documentId}?preview=true`);
      const previewData = await previewRes.json();
      setPreviewHtml(previewData.previewHtml || '');
      setChecklist(previewData.checklist || []);
    }
  }, [documentId]);

  useEffect(() => {
    if (docStatus === 'processing') {
      const interval = setInterval(pollStatus, 2000);
      return () => clearInterval(interval);
    } else {
      pollStatus();
    }
  }, [docStatus, pollStatus]);

  const handleDownload = async () => {
    if (!isVip && !canPreviewFull) {
      setShowPayment(true);
      return;
    }
    window.open(`/api/documents/${documentId}/download`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{documentName}</h1>
          <p className="text-sm text-gray-500 mt-1">
            状态：
            {docStatus === 'processing' && <span className="text-accent">⏳ 处理中...</span>}
            {docStatus === 'done' && <span className="text-success">✅ 处理完成</span>}
            {docStatus === 'error' && <span className="text-danger">❌ 处理失败</span>}
          </p>
        </div>
        <button onClick={handleDownload} className="btn-primary">
          💾 下载文档
        </button>
      </div>

      <div className="flex gap-6">
        <aside className="w-64 flex-shrink-0">
          <FormatChecklist items={checklist} />
          {!isVip && (
            <div className="card mt-4 bg-accent-50 border-accent">
              <p className="text-sm font-medium text-accent-600">🔒 免费用户</p>
              <p className="text-xs text-gray-600 mt-1">仅预览前3页，付费后可下载完整文档</p>
              <button onClick={() => setShowPayment(true)} className="btn-accent w-full mt-3 text-sm py-2">
                💎 立即解锁
              </button>
            </div>
          )}
          {isVip && (
            <div className="card mt-4 bg-green-50">
              <p className="text-sm font-medium text-success">💎 VIP用户</p>
              <p className="text-xs text-gray-600 mt-1">全文预览 · 无水印下载</p>
            </div>
          )}
        </aside>

        <main className="flex-1">
          {docStatus === 'processing' && (
            <div className="text-center py-20">
              <div className="text-4xl mb-4 animate-bounce">⚙️</div>
              <p className="text-lg text-gray-600">AI正在处理你的论文...</p>
              <p className="text-sm text-gray-400 mt-2">预计需要30秒~2分钟</p>
            </div>
          )}
          {docStatus === 'error' && (
            <div className="text-center py-20">
              <div className="text-4xl mb-4">❌</div>
              <p className="text-lg text-gray-600">处理失败，请重试</p>
            </div>
          )}
          {docStatus === 'done' && (
            <DocumentPreview
              previewHtml={previewHtml}
              isRestricted={!canPreviewFull}
            />
          )}
        </main>
      </div>

      {showPayment && (
        <PaymentModal
          documentId={documentId}
          onClose={() => setShowPayment(false)}
          onSuccess={() => { setShowPayment(false); router.refresh(); }}
        />
      )}
    </div>
  );
}
