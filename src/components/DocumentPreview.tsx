'use client';

interface DocumentPreviewProps {
  previewHtml: string;
  isRestricted: boolean;
}

export function DocumentPreview({ previewHtml, isRestricted }: DocumentPreviewProps) {
  return (
    <div className="relative">
      <div
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 min-h-[600px] max-h-[80vh] overflow-y-auto prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: previewHtml }}
      />
      {isRestricted && (
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-white to-transparent flex flex-col items-center justify-end pb-8">
          <div className="text-center bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <p className="text-lg font-semibold text-gray-800 mb-2">🔒 免费预览仅限前3页</p>
            <p className="text-sm text-gray-500 mb-4">付费后可查看和下载完整文档</p>
            <button className="btn-accent">💎 解锁全文 ¥5.9</button>
          </div>
        </div>
      )}
      {!isRestricted && (
        <div className="absolute top-2 right-2 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
          ✓ 全文预览
        </div>
      )}
    </div>
  );
}
