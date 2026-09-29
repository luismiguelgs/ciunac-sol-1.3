import { requestJson, requestJsonResult } from '@/modules/shared/infrastructure/http/browser-http'
import type { AppResult } from '@/modules/shared/application/results/app-result'

function resourcePath(path: string): string {
  return `/api/ciunac/${path.replace(/^\/+/, '')}`
}

export function apiFetchResult<T>(path: string, method: string, body?: unknown): Promise<AppResult<T>> {
  return requestJsonResult<T>(resourcePath(path), method, body)
}

export function apiFetch<T>(path: string, method: string, body?: unknown): Promise<T> {
  return requestJson<T>(resourcePath(path), method, body)
}

export async function apiFetchOptional<T>(path: string, method: string): Promise<T | null> {
  const result = await apiFetchResult<T>(path, method)
  if (!result.ok) {
    if (result.error.status === 404) return null
    throw result.error
  }
  return result.kind === 'empty' ? null : result.data
}

export async function apiCommand(path: string, method: string, body?: unknown): Promise<void> {
  const result = await apiFetchResult<unknown>(path, method, body)
  if (!result.ok) throw result.error
}

export function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  return requestJson<T>(resourcePath(path), 'POST', formData)
}
