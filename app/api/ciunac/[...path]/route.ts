import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { ciunacRequest } from '@/modules/security/server/ciunac-client';
import { assertTrustedOrigin, parseJsonBody } from '@/modules/security/server/request-security';
import { securityErrorResponse } from '@/modules/security/server/responses';
import { resolveCiunacBodySchema } from '@/modules/security/server/schemas';
import {
  readConsultationSessionFromRequest,
  readVerifiedSessionFromRequest,
} from '@/modules/security/server/session';
import { SecurityError } from '@/modules/security/server/security-error';

export const runtime = 'nodejs';

type RouteContext = { params: Promise<{ path: string[] }> };
type AllowedMethod = 'GET' | 'POST' | 'PATCH';
type Access = 'public' | 'verified' | 'consultation' | 'either' | 'nuevo';

const PUBLIC_GET = new Set([
  'tipossolicitud',
  'idiomas',
  'facultades',
  'escuelas',
  'textos',
  'ciclos',
  'salones',
  'cronogramaubicacion',
  'examenesubicacion',
]);

const SAFE_SEGMENT = /^[A-Za-z0-9_-]+$/;
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const ALLOWED_UPLOAD_TYPES = new Set(['image/jpeg', 'image/png', 'application/pdf']);

function resolveAccess(method: AllowedMethod, path: string): Access | null {
  if (method === 'GET' && PUBLIC_GET.has(path)) return 'public';

  if (method === 'GET' && /^(estudiantes\/buscar|solicitudes\/documento)\/[A-Za-z0-9_-]+$/.test(path)) {
    return 'verified';
  }
  if (method === 'GET' && /^(solicitudes|certificados|constancias)\/[A-Za-z0-9_-]+$/.test(path)) {
    return 'either';
  }
  if (method === 'GET' && /^(certificados|constancias)\/solicitud\/[A-Za-z0-9_-]+$/.test(path)) {
    return 'either';
  }
  if (method === 'GET' && /^detallesubicacion\/estudiante\/documento\/[A-Za-z0-9_-]+$/.test(path)) {
    return 'consultation';
  }
  if (method === 'POST' && /^(estudiantes|solicitudes|solicitudbecas)$/.test(path)) {
    return 'verified';
  }
  if (method === 'POST' && path === 'q10/estudiantes') {
    return 'nuevo';
  }
  if (method === 'POST' && /^upload\/(dnis|vouchers|becas)$/.test(path)) {
    return 'verified';
  }
  if (method === 'PATCH' && /^estudiantes\/[A-Za-z0-9_-]+$/.test(path)) {
    return 'verified';
  }
  if (method === 'PATCH' && /^(certificados|constancias)\/[A-Za-z0-9_-]+$/.test(path)) {
    return 'consultation';
  }

  return null;
}

function assertAccess(request: NextRequest, access: Access): void {
  if (access === 'public') return;

  const verified = readVerifiedSessionFromRequest(request);
  const consultation = readConsultationSessionFromRequest(request);
  const allowed = access === 'verified'
    ? Boolean(verified)
    : access === 'consultation'
      ? Boolean(consultation)
      : access === 'nuevo'
        ? verified?.purpose === 'NUEVO'
        : Boolean(verified || consultation);

  if (!allowed) throw new SecurityError('UNAUTHORIZED', 401, 'The required session is missing');
}

async function readUpload(request: NextRequest): Promise<FormData> {
  const contentType = request.headers.get('content-type') ?? '';
  const contentLength = Number(request.headers.get('content-length') ?? '0');

  if (!contentType.toLowerCase().startsWith('multipart/form-data')) {
    throw new SecurityError('INVALID_REQUEST', 415, 'A multipart request is required');
  }
  if (!Number.isFinite(contentLength) || contentLength <= 0 || contentLength > MAX_UPLOAD_BYTES) {
    throw new SecurityError('INVALID_REQUEST', 413, 'Upload is too large');
  }

  const formData = await request.formData();
  const file = formData.get('file');
  if (!(file instanceof File) || file.size <= 0 || file.size > MAX_UPLOAD_BYTES || !ALLOWED_UPLOAD_TYPES.has(file.type)) {
    throw new SecurityError('INVALID_REQUEST', 400, 'Upload file is invalid');
  }

  return formData;
}

async function handle(request: NextRequest, context: RouteContext, method: AllowedMethod) {
  const correlationId = randomUUID();

  try {
    const { path: segments } = await context.params;
    if (!segments.length || segments.some((segment) => !SAFE_SEGMENT.test(segment))) {
      throw new SecurityError('INVALID_REQUEST', 400, 'Invalid API path');
    }

    const path = segments.join('/');
    const access = resolveAccess(method, path);
    if (!access || path === 'mailer') {
      throw new SecurityError('FORBIDDEN', 403, 'API operation is not allowed');
    }

    assertAccess(request, access);
    if (method !== 'GET') assertTrustedOrigin(request);

    let body: unknown;
    if (method === 'POST' && path.startsWith('upload/')) {
      body = await readUpload(request);
    } else if (method !== 'GET') {
      body = await parseJsonBody(request, resolveCiunacBodySchema(method, path));
    }

    const data = await ciunacRequest<unknown>(path, { method, body });
    if (data === null) return new NextResponse(null, { status: 204 });
    return NextResponse.json(data);
  } catch (error) {
    return securityErrorResponse('security.bff.request.failed', correlationId, error);
  }
}

export function GET(request: NextRequest, context: RouteContext) {
  return handle(request, context, 'GET');
}

export function POST(request: NextRequest, context: RouteContext) {
  return handle(request, context, 'POST');
}

export function PATCH(request: NextRequest, context: RouteContext) {
  return handle(request, context, 'PATCH');
}
