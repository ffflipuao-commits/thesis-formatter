import crypto from 'crypto';

const PAYJS_BASE = 'https://payjs.cn/api';

interface CreateOrderParams {
  totalFee: number;
  outTradeNo: string;
  body: string;
  attach?: string;
  type?: 'wechat' | 'alipay';
}

function sign(params: Record<string, any>): string {
  const key = process.env.PAYJS_KEY!;
  const sorted = Object.keys(params)
    .filter(k => params[k] !== '' && params[k] !== undefined && params[k] !== null)
    .sort()
    .map(k => `${k}=${params[k]}`)
    .join('&');
  return crypto.createHash('md5').update(`${sorted}&key=${key}`).digest('hex').toUpperCase();
}

export async function createPayOrder(params: CreateOrderParams) {
  const body = {
    mchid: process.env.PAYJS_MCHID,
    total_fee: params.totalFee,
    out_trade_no: params.outTradeNo,
    body: params.body,
    attach: params.attach || '',
    notify_url: process.env.PAYJS_NOTIFY_URL,
    type: params.type || 'wechat',
  };

  const res = await fetch(`${PAYJS_BASE}/native`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ ...body, sign: sign(body) } as any).toString(),
  });

  return res.json();
}

export function verifyPaySign(params: Record<string, any>): boolean {
  const receivedSign = params.sign;
  const computedSign = sign({ ...params, sign: undefined });
  return receivedSign === computedSign;
}

export function generateOutTradeNo(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `TF${timestamp}${random}`.toUpperCase();
}
