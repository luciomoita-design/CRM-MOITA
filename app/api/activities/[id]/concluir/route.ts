import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth/options';
import { prisma } from '@/server/prisma';

export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const activity = await prisma.activity.update({
    where: { id: params.id },
    data: { doneAt: new Date() }
  });

  return NextResponse.json(activity);
}
