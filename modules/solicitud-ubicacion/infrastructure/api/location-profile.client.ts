import { AppError } from '@/modules/shared/application/errors/app-error'

export async function saveLocationProfile(isCiunacStudent: boolean): Promise<void> {
  let response: Response
  try {
    response = await fetch('/api/security/ubicacion/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ isCiunacStudent }),
    })
  } catch (error) {
    throw new AppError({ code: 'NETWORK', message: 'No se pudo guardar el perfil de ubicacion.', cause: error })
  }
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: { message?: string } } | null
    throw new AppError({
      code: response.status === 401 ? 'AUTHENTICATION' : 'VALIDATION',
      status: response.status,
      message: payload?.error?.message ?? 'No se pudo guardar el perfil de ubicacion.',
    })
  }
}
