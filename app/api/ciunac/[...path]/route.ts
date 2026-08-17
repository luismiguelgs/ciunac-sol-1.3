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
import { validateVoucherUpload } from '@/modules/security/server/voucher-upload-validation';
import { MAX_VOUCHER_FILE_BYTES } from '@/modules/shared/domain/voucher-file-policy';
import { validateScholarshipDocumentUpload } from '@/modules/solicitud-beca/server';
import { validateCertificateRequestPrice } from '@/modules/solicitud-certificado/server';
import { validateConstanciaRequestPrice } from '@/modules/solicitud-constancia/server';
import {
  q10StudentRequestSchema,
  validateNewStudentRequest,
} from '@/modules/solicitud-nuevo/server'
import {
  locationCreateCommandDtoSchema,
  validateIdentityDocumentUpload,
  validateLocationStudyCertificateUpload,
  validateLocationRequest,
  validateLocationStudentRequest,
} from '@/modules/solicitud-ubicacion/server'

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
const MAX_UPLOAD_REQUEST_BYTES = MAX_VOUCHER_FILE_BYTES + (256 * 1024);
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

async function readUpload(request: NextRequest, path: string): Promise<FormData> {
  const contentType = request.headers.get('content-type') ?? '';
  const contentLength = Number(request.headers.get('content-length') ?? '0');

  if (!contentType.toLowerCase().startsWith('multipart/form-data')) {
    throw new SecurityError('INVALID_REQUEST', 415, 'A multipart request is required');
  }
  if (!Number.isFinite(contentLength) || contentLength <= 0 || contentLength > MAX_UPLOAD_REQUEST_BYTES) {
    throw new SecurityError('INVALID_REQUEST', 413, 'Upload is too large');
  }

  const formData = await request.formData();
  const file = formData.get('file');
  if (!(file instanceof File) || file.size <= 0 || file.size > MAX_VOUCHER_FILE_BYTES || !ALLOWED_UPLOAD_TYPES.has(file.type)) {
    throw new SecurityError('INVALID_REQUEST', 400, 'Upload file is invalid');
  }
  if (path === 'upload/vouchers') await validateVoucherUpload(formData);
  if (path === 'upload/becas') {
    const purpose = readVerifiedSessionFromRequest(request)?.purpose;
    if (purpose === 'UBICACION') await validateLocationStudyCertificateUpload(formData);
    else if (purpose === 'BECA') await validateScholarshipDocumentUpload(formData);
    else throw new SecurityError('FORBIDDEN', 403, 'This document upload is not allowed');
  }
  if (path === 'upload/dnis') await validateIdentityDocumentUpload(formData);

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
      body = await readUpload(request, path);
    } else if (method !== 'GET') {
      const schema = method === 'POST' && path === 'q10/estudiantes'
        ? q10StudentRequestSchema
        : method === 'POST'
          && path === 'solicitudes'
          && readVerifiedSessionFromRequest(request)?.purpose === 'UBICACION'
          ? locationCreateCommandDtoSchema
          : resolveCiunacBodySchema(method, path);
      body = await parseJsonBody(request, schema);
    }

    if ((method === 'POST' && path === 'estudiantes') || (method === 'PATCH' && path.startsWith('estudiantes/'))) {
      body = validateLocationStudentRequest(request, body)
    }
    if (method === 'POST' && path === 'solicitudes') {
      body = await validateLocationRequest(request, body)
      await validateCertificateRequestPrice(body);
      await validateConstanciaRequestPrice(body);
    }
    if (method === 'POST' && path === 'q10/estudiantes') {
      body = await validateNewStudentRequest(request, body)
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
