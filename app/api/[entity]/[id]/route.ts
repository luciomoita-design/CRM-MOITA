import { NextRequest } from 'next/server';
import { handleDelete, handleDetail, handleUpdate } from '@/lib/api/crud-handlers';
import { entityConfigs } from '@/lib/api/entity-config';

export async function GET(request: NextRequest, { params }: { params: { entity: string; id: string } }) {
  const entity = params.entity as keyof typeof entityConfigs;
  if (!entityConfigs[entity]) {
    return new Response('Entity not found', { status: 404 });
  }
  return handleDetail(request, entity, params.id);
}

export async function PATCH(request: NextRequest, { params }: { params: { entity: string; id: string } }) {
  const entity = params.entity as keyof typeof entityConfigs;
  if (!entityConfigs[entity]) {
    return new Response('Entity not found', { status: 404 });
  }
  return handleUpdate(request, entity, params.id);
}

export async function DELETE(request: NextRequest, { params }: { params: { entity: string; id: string } }) {
  const entity = params.entity as keyof typeof entityConfigs;
  if (!entityConfigs[entity]) {
    return new Response('Entity not found', { status: 404 });
  }
  return handleDelete(request, entity, params.id);
}
