import { NextRequest } from 'next/server';
import { generateServiceToken, verifyServiceToken } from '@/server/auth/service-token';

const findUnique = vi.fn();
const update = vi.fn().mockResolvedValue({});

vi.mock('@/server/prisma', () => ({
  prisma: {
    serviceToken: {
      findUnique: (...args: unknown[]) => findUnique(...args),
      update: (...args: unknown[]) => update(...args)
    }
  }
}));

function requestWithAuth(header?: string) {
  return new NextRequest('https://crm.local/api/prospecting/queue', {
    headers: header ? { authorization: header } : {}
  });
}

describe('service token auth', () => {
  beforeEach(() => {
    findUnique.mockReset();
    update.mockClear();
  });

  it('gera um token cujo hash bate na verificação', async () => {
    const { raw, prefix, hash } = generateServiceToken();
    expect(raw.startsWith('mst_')).toBe(true);
    expect(prefix).toBe(raw.slice(0, 12));

    findUnique.mockResolvedValue({
      id: 'token-1',
      organizationId: 'org-1',
      actingUserId: 'user-ia',
      escopos: ['prospecting'],
      ativo: true,
      expiraEm: null,
      tokenHash: hash
    });

    const ctx = await verifyServiceToken(requestWithAuth(`Bearer ${raw}`));
    expect(ctx).toEqual({
      organizationId: 'org-1',
      tokenId: 'token-1',
      actingUserId: 'user-ia',
      scopes: ['prospecting']
    });
  });

  it('rejeita token inativo', async () => {
    const { raw, hash } = generateServiceToken();
    findUnique.mockResolvedValue({
      id: 'token-1',
      organizationId: 'org-1',
      actingUserId: 'user-ia',
      escopos: [],
      ativo: false,
      expiraEm: null,
      tokenHash: hash
    });

    const ctx = await verifyServiceToken(requestWithAuth(`Bearer ${raw}`));
    expect(ctx).toBeNull();
  });

  it('rejeita token expirado', async () => {
    const { raw, hash } = generateServiceToken();
    findUnique.mockResolvedValue({
      id: 'token-1',
      organizationId: 'org-1',
      actingUserId: 'user-ia',
      escopos: [],
      ativo: true,
      expiraEm: new Date(Date.now() - 1000),
      tokenHash: hash
    });

    const ctx = await verifyServiceToken(requestWithAuth(`Bearer ${raw}`));
    expect(ctx).toBeNull();
  });

  it('rejeita header ausente ou malformado sem lançar erro', async () => {
    expect(await verifyServiceToken(requestWithAuth(undefined))).toBeNull();
    expect(await verifyServiceToken(requestWithAuth('Basic abc123'))).toBeNull();
    expect(findUnique).not.toHaveBeenCalled();
  });

  it('rejeita token com hash inválido', async () => {
    const { raw, hash } = generateServiceToken();
    const { raw: outroRaw } = generateServiceToken();
    findUnique.mockResolvedValue({
      id: 'token-1',
      organizationId: 'org-1',
      actingUserId: 'user-ia',
      escopos: [],
      ativo: true,
      expiraEm: null,
      tokenHash: hash
    });

    const ctx = await verifyServiceToken(requestWithAuth(`Bearer ${outroRaw}`));
    expect(ctx).toBeNull();
  });
});
