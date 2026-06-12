'use client';

import { useState, useEffect } from 'react';
import type { PlanType } from '@/types';

interface PaymentModalProps {
  plan?: PlanType;
  documentId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function PaymentModal({ plan = 'once', documentId, onClose, onSuccess }: PaymentModalProps) {
  const [qrCode, setQrCode] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [loading, setLoading] = useState(true);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    createPayment();
  }, []);

  const createPayment = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, documentId }),
      });
      const data = await res.json();
      if (data.qrcode) {
        setQrCode(data.qrcode);
        setPaymentId(data.paymentId);
        startPolling(data.paymentId);
      }
    } catch (err) {
      console.error('创建支付失败', err);
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (id: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payment/status?id=${id}`);
        const data = await res.json();
        if (data.status === 'paid') {
          clearInterval(interval);
          setPaid(true);
          setTimeout(onSuccess, 1500);
        }
      } catch {}
    }, 3000);
    setTimeout(() => clearInterval(interval), 300000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-center mb-4">
          {paid ? '✅ 支付成功！' : '📱 扫码支付'}
        </h2>

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin text-4xl mb-2">⏳</div>
            <p className="text-gray-500">生成支付二维码...</p>
          </div>
        )}

        {!loading && !paid && qrCode && (
          <div className="text-center">
            <img src={`data:image/png;base64,${qrCode}`} alt="支付二维码" className="mx-auto w-48 h-48" />
            <p className="text-sm text-gray-500 mt-4">请使用微信/支付宝扫码支付</p>
            <p className="text-xs text-gray-400 mt-1">支付完成后自动跳转</p>
          </div>
        )}

        {paid && (
          <div className="text-center py-4">
            <div className="text-5xl mb-2">🎉</div>
            <p className="text-gray-600">正在跳转...</p>
          </div>
        )}

        <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600 mt-4 mx-auto block">
          取消
        </button>
      </div>
    </div>
  );
}
