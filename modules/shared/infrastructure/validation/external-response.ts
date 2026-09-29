import { z } from 'zod';
import { AppError } from '@/modules/shared/application/errors/app-error';

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
