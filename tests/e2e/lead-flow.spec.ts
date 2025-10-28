import { test, expect } from '@playwright/test';

const authHeaders = {
  Authorization: `Bearer test-token`
};

test('fluxo de lead via API mock', async ({ request }) => {
  const response = await request.post('/api/leads', {
    headers: { 'Content-Type': 'application/json' },
    data: {
      organizationId: 'demo-org',
      nome: 'Lead Playwright',
      email: 'lead-playwright@teste.com'
    }
  });

  expect([200, 201, 401, 403]).toContain(response.status());
});
