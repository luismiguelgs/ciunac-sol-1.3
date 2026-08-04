import { AppError } from '@/modules/shared/application/errors/app-error';

export type AppResult<T> =
  | { ok: true; kind: 'data'; data: T }
  | { ok: true; kind: 'empty' }
  | { ok: false; kind: 'error'; error: AppError };

export function dataResult<T>(data: T): AppResult<T> {
  return { ok: true, kind: 'data', data };
}

export function emptyResult<T = never>(): AppResult<T> {
  return { ok: true, kind: 'empty' };
}

export function errorResult<T = never>(error: AppError): AppResult<T> {
  return { ok: false, kind: 'error', error };
}
