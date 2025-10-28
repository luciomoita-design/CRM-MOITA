import { Webhook } from '@prisma/client';
import crypto from 'crypto';

export async function dispatchWebhook(webhook: Webhook, payload: any) {
  const body = JSON.stringify(payload);
  const signature = crypto.createHmac('sha256', webhook.secret).update(body).digest('hex');
  await fetch(webhook.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Moita-Signature': signature
    },
    body
  });
}
