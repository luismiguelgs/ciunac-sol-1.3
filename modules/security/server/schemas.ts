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
  type: z.enum(['CERTIFICADO', 'CONSTANCIA', 'BECA', 'UBICACION', 'REGISTER']),
  reference: z.string().trim().min(1).max(80),
}).strict();
