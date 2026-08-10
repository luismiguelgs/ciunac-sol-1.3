import { z } from 'zod';
import { CONSULTATION_TYPES, OTP_PURPOSES } from '@/modules/security/domain/security.types';
import { q10StudentRequestSchema } from '@/modules/solicitud-nuevo/infrastructure/validation/q10-api.schemas'
import { locationCreateCommandDtoSchema } from '@/modules/solicitud-ubicacion/infrastructure/validation/location-api.schemas'

const emailSchema = z.string().trim().email().max(254).transform((email) => email.toLowerCase());
const captchaTokenSchema = z.string().trim().min(10).max(4096);

export const otpRequestSchema = z.object({
  email: emailSchema,
  purpose: z.enum(OTP_PURPOSES),
  captchaToken: captchaTokenSchema,
}).strict();

export const otpVerifySchema = z.object({
  email: emailSchema,
  purpose: z.enum(OTP_PURPOSES),
  code: z.string().regex(/^\d{6}$/),
}).strict();

export const consultationSchema = z.object({
  documento: z.string().trim().min(8).max(12).regex(/^[A-Za-z0-9]+$/).transform((value) => value.toUpperCase()),
  type: z.enum(CONSULTATION_TYPES),
  captchaToken: captchaTokenSchema,
}).strict();

export const notificationSchema = z.object({
  type: z.enum(['CERTIFICADO', 'CONSTANCIA', 'BECA', 'UBICACION', 'REGISTER']),
  reference: z.string().trim().min(1).max(80),
}).strict();

const shortText = z.string().trim().max(254);
const identifier = z.string().trim().min(1).max(80);
const documentReference = z.string().trim().min(1).max(2048).refine(
  (value) => value.startsWith('/') || /^https?:\/\//i.test(value),
);

const studentApiSchema = z.object({
  nombres: shortText.min(1),
  apellidos: shortText.min(1),
  tipoDocumento: z.enum(['DNI', 'CE', 'PASAPORTE']),
  numeroDocumento: z.string().trim().min(8).max(12).regex(/^[A-Za-z0-9]+$/),
  celular: z.string().trim().min(7).max(20),
  email: z.string().email().max(254).optional(),
  facultadId: z.number().int().positive().optional(),
  escuelaId: z.number().int().positive().optional(),
  codigo: shortText.optional(),
  imgDoc: documentReference.optional(),
}).strict();

const solicitudApiSchema = z.object({
  estudianteId: identifier,
  tipoSolicitudId: z.number().int().positive(),
  idiomaId: z.number().int().positive(),
  nivelId: z.number().int().positive(),
  estadoId: z.number().int().positive(),
  periodo: shortText.min(1),
  alumnoCiunac: z.boolean().optional(),
  fechaPago: z.string().datetime().optional(),
  pago: z.number().nonnegative(),
  digital: z.boolean().optional(),
  numeroVoucher: z.string().regex(/^\d{15}$/).optional(),
  imgCertEstudio: z.string().max(2048).optional(),
  imgVoucher: documentReference.optional(),
}).strict().superRefine((data, context) => {
  if (data.pago <= 0) return;
  if (!data.fechaPago) context.addIssue({ code: 'custom', path: ['fechaPago'], message: 'Payment date is required' });
  if (!data.numeroVoucher) context.addIssue({ code: 'custom', path: ['numeroVoucher'], message: 'Voucher number is required' });
  if (!data.imgVoucher) context.addIssue({ code: 'custom', path: ['imgVoucher'], message: 'Voucher file is required' });
});

const solicitudBecaApiSchema = z.object({
  nombres: shortText.min(1),
  apellidos: shortText.min(1),
  telefono: z.string().trim().regex(/^\d{9}$/),
  tipo_documento: z.enum(['DNI', 'CE', 'PASAPORTE']),
  numero_documento: z.string().trim().regex(/^[A-Za-z0-9]{8,9}$/),
  facultad: shortText.min(1),
  facultadId: z.string().trim().regex(/^[1-9]\d*$/),
  escuela: shortText.min(1),
  escuelaId: z.string().trim().regex(/^[1-9]\d*$/),
  codigo: shortText.min(1),
  direccion: z.string().trim().max(500),
  email: z.string().email().max(254),
  periodo: shortText.min(1),
  carta_de_compromiso: documentReference,
  historial_academico: documentReference,
  constancia_matricula: documentReference,
  contancia_tercio: documentReference,
  declaracion_jurada: documentReference,
}).strict().superRefine((data, context) => {
  const expectedLength = data.tipo_documento === 'DNI' ? 8 : 9;
  if (data.numero_documento.length !== expectedLength) {
    context.addIssue({ code: 'custom', path: ['numero_documento'], message: 'Invalid document length' });
  }
});

const statusApiSchema = z.object({
  aceptado: z.boolean(),
  fechaAceptacion: z.string().datetime(),
}).strict();

export function resolveCiunacBodySchema(method: 'POST' | 'PATCH', path: string): z.ZodType {
  if (path === 'estudiantes' || (method === 'PATCH' && path.startsWith('estudiantes/'))) {
    return studentApiSchema;
  }
  if (path === 'solicitudes') return z.union([solicitudApiSchema, locationCreateCommandDtoSchema]);
  if (path === 'solicitudbecas') return solicitudBecaApiSchema;
  if (path === 'q10/estudiantes') return q10StudentRequestSchema;
  if (method === 'PATCH' && /^(certificados|constancias)\//.test(path)) return statusApiSchema;

  return z.never();
}
