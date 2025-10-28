import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth/options';
import { recalculateScores, ScoringEntity } from '@/server/services/scoring-service';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const entity = searchParams.get('entity') as ScoringEntity;
  const organizationId = searchParams.get('organizationId');
  if (!entity || !organizationId) {
    return new NextResponse('Parâmetros inválidos', { status: 400 });
  }

  await recalculateScores(entity, organizationId);
  return NextResponse.json({ success: true });
}
