import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth/options';
import { columnMappingSchema, importLeadsFromCsv } from '@/server/services/lead-import-service';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  if (!['admin', 'manager'].includes(session.user.role)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get('file');
  const organizationId = formData.get('organizationId');
  const mappingRaw = formData.get('mapping');

  if (!(file instanceof File) || typeof organizationId !== 'string' || typeof mappingRaw !== 'string') {
    return new NextResponse('Campos obrigatórios: file, organizationId, mapping', { status: 400 });
  }

  const mapping = columnMappingSchema.parse(JSON.parse(mappingRaw));
  const fileText = await file.text();

  const summary = await importLeadsFromCsv({
    organizationId,
    fileText,
    fileName: file.name,
    mapping,
    importadoPorId: session.user.id
  });

  return NextResponse.json(summary, { status: 201 });
}
