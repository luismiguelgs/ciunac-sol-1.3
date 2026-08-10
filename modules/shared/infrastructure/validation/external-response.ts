import { z } from 'zod';
import { AppError } from '@/modules/shared/application/errors/app-error';

export const externalRecordSchema = z.object({}).passthrough();
export const externalRecordArraySchema = z.array(externalRecordSchema);
export const studentResponseSchema = z.object({
  id: z.union([z.string().min(1), z.number()]).transform(String),
}).passthrough();
export const requestIdResponseSchema = z.object({
  id: z.union([z.string().min(1), z.number()]).transform(String),
}).passthrough();
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
