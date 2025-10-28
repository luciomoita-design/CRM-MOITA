import { NextResponse } from 'next/server';
import { prisma } from '@/server/prisma';
import { dispatchWebhook } from '@/server/services/webhook-service';

export async function POST() {
  const webhook = await prisma.webhook.findFirst();
  if (!webhook) {
    return new NextResponse('Nenhum webhook configurado', { status: 404 });
  }
  await dispatchWebhook(webhook, { event: 'test', payload: { ok: true } });
  return NextResponse.json({ success: true });
}
