import { z } from 'zod';
import { CONSULTATION_TYPES, OTP_PURPOSES } from '@/modules/security/domain/security.types';

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
  type: z.enum(['CERTIFICADO', 'BECA', 'UBICACION', 'REGISTER']),
  reference: z.string().trim().min(1).max(80),
}).strict();

const shortText = z.string().trim().max(254);
const identifier = z.string().trim().min(1).max(80);

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
}).strict();

const solicitudApiSchema = z.object({
  estudianteId: identifier,
  tipoSolicitudId: z.number().int().positive(),
  idiomaId: z.number().int().positive(),
  nivelId: z.number().int().positive(),
  estadoId: z.number().int().positive(),
  periodo: shortText.min(1),
  alumnoCiunac: z.boolean().optional(),
  fechaPago: z.string().max(80).optional(),
  pago: z.number().nonnegative(),
  digital: z.boolean().optional(),
  numeroVoucher: shortText.optional(),
  imgCertEstudio: z.string().max(2048).optional(),
  imgVoucher: z.string().max(2048).optional(),
}).strict();

const solicitudBecaApiSchema = z.object({
  _id: identifier.optional(),
  id: identifier.optional(),
  nombres: shortText.min(1),
  apellidos: shortText.min(1),
  telefono: shortText.min(1),
  tipo_documento: z.enum(['DNI', 'CE', 'PASAPORTE']),
  numero_documento: identifier,
  facultad: shortText,
  facultadId: shortText,
  escuela: shortText,
  escuelaId: shortText,
  codigo: shortText,
  direccion: z.string().trim().max(500),
  email: z.string().email().max(254),
  periodo: shortText,
  carta_de_compromiso: z.string().max(2048),
  historial_academico: z.string().max(2048),
  constancia_matricula: z.string().max(2048),
  contancia_tercio: z.string().max(2048),
  declaracion_jurada: z.string().max(2048),
  estado: shortText.optional(),
  observaciones: z.string().max(1000).optional(),
  creado_en: z.string().max(80).optional(),
  modificado_en: z.string().max(80).optional(),
}).strict();

const q10StudentApiSchema = z.object({
  Codigo_estudiante: shortText.optional(),
  Primer_apellido: shortText.min(1),
  Segundo_apellido: shortText,
  Primer_nombre: shortText.min(1),
  Segundo_nombre: shortText.optional(),
  Email: z.string().email().max(254),
  Codigo_tipo_identificacion: shortText.min(1),
  Numero_identificacion: identifier,
  Genero: shortText.min(1),
  Fecha_nacimiento: z.string().max(80),
  Telefono: shortText,
  Celular: shortText,
  Lugar_nacimiento: shortText.optional(),
  Direccion: z.string().max(500).optional(),
  Lugar_residencia: shortText.optional(),
  Codigo_programa: shortText.min(1),
  Consecutivo_periodo: z.number().int().optional(),
  Consecutivo_sedejornada: z.number().int().optional(),
}).strict();

const statusApiSchema = z.object({
  aceptado: z.boolean(),
  fechaAceptacion: z.string().datetime(),
}).strict();

export function resolveCiunacBodySchema(method: 'POST' | 'PATCH', path: string): z.ZodType {
  if (path === 'estudiantes' || (method === 'PATCH' && path.startsWith('estudiantes/'))) {
    return studentApiSchema;
  }
  if (path === 'solicitudes') return solicitudApiSchema;
  if (path === 'solicitudbecas') return solicitudBecaApiSchema;
  if (path === 'q10/estudiantes') return q10StudentApiSchema;
  if (method === 'PATCH' && /^(certificados|constancias)\//.test(path)) return statusApiSchema;

  return z.never();
}
