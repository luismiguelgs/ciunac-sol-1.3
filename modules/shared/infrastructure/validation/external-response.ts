import { z } from 'zod';
import { AppError } from '@/modules/shared/application/errors/app-error';

export const externalRecordSchema = z.object({}).passthrough();
export const externalRecordArraySchema = z.array(externalRecordSchema);
export const certificateResponseSchema = z.object({
  notas: z.array(z.object({
    ciclo: z.string().min(1),
    periodo: z.string().optional().default(''),
    modalidad: z.string().optional().default(''),
    nota: z.number(),
  }).passthrough()).default([]),
}).passthrough();
export const studentResponseSchema = z.object({
  id: z.union([z.string().min(1), z.number()]).transform(String),
}).passthrough();
export const requestIdResponseSchema = z.object({
  id: z.union([z.string().min(1), z.number()]).transform(String),
}).passthrough();
export const scholarshipIdResponseSchema = z.object({
  _id: z.string().min(1).optional(),
  id: z.string().min(1).optional(),
}).passthrough().refine((value) => Boolean(value._id || value.id));
export const uploadResponseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  folder: z.string().min(1),
  viewLink: z.string().min(1),
  downloadLink: z.string().min(1),
}).passthrough();

export function parseExternalResponse<T>(schema: z.ZodType<T>, value: unknown, message: string): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new AppError({
      code: 'EXTERNAL_SERVICE',
      message,
      details: { issueCount: result.error.issues.length },
    });
  }
  return result.data;
}
