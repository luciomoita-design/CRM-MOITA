import { NextRequest } from 'next/server';
import { handleCreate, handleList } from '@/lib/api/crud-handlers';
import { entityConfigs } from '@/lib/api/entity-config';

export async function GET(request: NextRequest, { params }: { params: { entity: string } }) {
  const entity = params.entity as keyof typeof entityConfigs;
  if (!entityConfigs[entity]) {
    return new Response('Entity not found', { status: 404 });
  }
  return handleList(request, entity);
}

export async function POST(request: NextRequest, { params }: { params: { entity: string } }) {
  const entity = params.entity as keyof typeof entityConfigs;
  if (!entityConfigs[entity]) {
    return new Response('Entity not found', { status: 404 });
  }
  return handleCreate(request, entity);
}
