import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth/options';
import { entityConfigs, EntityKey } from './entity-config';
import { prisma } from '@/server/prisma';
import { logger } from '@/server/logger';

export async function handleList(request: NextRequest, entity: EntityKey) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const config = entityConfigs[entity];
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') ?? '1');
  const perPage = Math.min(Number(searchParams.get('perPage') ?? '20'), 100);
  const q = searchParams.get('q');

  const skip = (page - 1) * perPage;

  const where = q && config.searchable && config.searchable.length > 0
    ? {
        OR: config.searchable.map((field) => ({
          [field]: { contains: q, mode: 'insensitive' }
        }))
      }
    : {};

  const model = (prisma as any)[config.model];

  const [items, total] = await Promise.all([
    model.findMany({ skip, take: perPage, where }),
    model.count({ where })
  ]);

  return NextResponse.json({ items, page, perPage, total });
}

export async function handleCreate(request: NextRequest, entity: EntityKey) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const config = entityConfigs[entity];
  const payload = await request.json();
  const data = config.schema.parse(payload);

  const model = (prisma as any)[config.model];
  const created = await model.create({ data });
  logger.info({ entity, id: created.id }, 'entity created');
  return NextResponse.json(created, { status: 201 });
}

export async function handleDetail(request: NextRequest, entity: EntityKey, id: string) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const config = entityConfigs[entity];
  const model = (prisma as any)[config.model];
  const record = await model.findUnique({ where: { id } });
  if (!record) {
    return new NextResponse('Not found', { status: 404 });
  }
  return NextResponse.json(record);
}

export async function handleUpdate(request: NextRequest, entity: EntityKey, id: string) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const config = entityConfigs[entity];
  const payload = await request.json();
  const data = config.schema.partial().parse(payload);
  const model = (prisma as any)[config.model];
  const updated = await model.update({ where: { id }, data });
  logger.info({ entity, id }, 'entity updated');
  return NextResponse.json(updated);
}

export async function handleDelete(request: NextRequest, entity: EntityKey, id: string) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const config = entityConfigs[entity];
  const model = (prisma as any)[config.model];
  await model.delete({ where: { id } });
  logger.info({ entity, id }, 'entity deleted');
  return NextResponse.json({ success: true });
}
