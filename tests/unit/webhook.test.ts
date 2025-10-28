import { dispatchWebhook } from '@/server/services/webhook-service';

vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));

describe('webhook dispatcher', () => {
  it('envia payload com assinatura', async () => {
    const webhook = {
      id: '1',
      organizationId: 'org',
      url: 'https://example.com',
      secret: 'segredo',
      events: ['test']
    } as any;

    await dispatchWebhook(webhook, { event: 'test' });

    expect(fetch).toHaveBeenCalledWith(
      'https://example.com',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'X-Moita-Signature': expect.any(String) })
      })
    );
  });
});
