'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
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
  const triggeredRef = useRef(false);
  const router = useRouter();

  // 从文档详情API拉取最新状态
  const fetchDocument = useCallback(async () => {
    const res = await fetch(`/api/documents/${documentId}`);
    const data = await res.json();
    setDocStatus(data.status);
    if (data.status === 'done') {
      setPreviewHtml(data.previewHtml || '');
      setChecklist(data.checklist || []);
    }
  }, [documentId]);

  // 触发格式处理
  const triggerFormat = useCallback(async () => {
    if (triggeredRef.current) return;
    triggeredRef.current = true;
    try {
      const res = await fetch('/api/format', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_id: documentId }),
      });
      const data = await res.json();
      if (data.status === 'done') {
        setDocStatus('done');
        setPreviewHtml(data.previewHtml || '');
        setChecklist(data.checklist || []);
      } else if (data.error) {
        setDocStatus('error');
      }
    } catch {
      setDocStatus('error');
    }
  }, [documentId]);

  useEffect(() => {
    if (docStatus === 'processing') {
      // 自动触发格式处理
      triggerFormat();
      // 同时轮询备用（如果触发没立即返回）
      const interval = setInterval(fetchDocument, 3000);
      const timeout = setTimeout(() => clearInterval(interval), 120000); // 2分钟超时
      return () => { clearInterval(interval); clearTimeout(timeout); };
    } else {
      fetchDocument();
    }
  }, [docStatus, triggerFormat, fetchDocument]);

  const handleDownload = () => {
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
            状态：{' '}
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
              <p className="text-lg text-gray-600">正在处理你的论文...</p>
              <p className="text-sm text-gray-400 mt-2">提取段落结构 · 分析格式 · 生成预览</p>
            </div>
          )}
          {docStatus === 'error' && (
            <div className="text-center py-20">
              <div className="text-4xl mb-4">❌</div>
              <p className="text-lg text-gray-600">处理失败</p>
              <button onClick={() => { setDocStatus('processing'); triggeredRef.current = false; }} className="btn-primary mt-4">
                重试
              </button>
            </div>
          )}
          {docStatus === 'done' && previewHtml && (
            <DocumentPreview
              previewHtml={previewHtml}
              isRestricted={!canPreviewFull}
            />
          )}
        </main>
      </div>

      {showPayment && (
        <PaymentModal
          plan="once"
          documentId={documentId}
          onClose={() => setShowPayment(false)}
          onSuccess={() => { setShowPayment(false); router.refresh(); }}
        />
      )}
    </div>
  );
}
