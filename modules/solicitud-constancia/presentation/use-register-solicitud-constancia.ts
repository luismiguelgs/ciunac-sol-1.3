import React from 'react'
import { normalizeAppError } from '@/modules/shared/application/errors/app-error'
import { SolicitudConstanciaDraft } from '@/modules/solicitud-constancia/domain/solicitud-constancia'
import { createRegisterSolicitudConstanciaUseCase } from '@/modules/solicitud-constancia/infrastructure/register-solicitud-constancia.adapters'

export type ConstanciaRegisterState = 'SAVE' | 'EMAIL' | 'EMAIL_ERROR' | 'ERROR'

export function useRegisterSolicitudConstancia(onSuccess: (requestId: string, receiptId: string) => void) {
  const useCase = React.useMemo(() => createRegisterSolicitudConstanciaUseCase(), [])
  const [loading, setLoading] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const [state, setState] = React.useState<ConstanciaRegisterState>('SAVE')
  const [message, setMessage] = React.useState('')
  const [savedRequestId, setSavedRequestId] = React.useState<string | null>(null)

  const submit = async (solicitud: SolicitudConstanciaDraft) => {
    if (savedRequestId) return
    setLoading(true)
    setState('SAVE')
    setOpen(true)
    try {
      const result = await useCase.execute({ solicitud })
      if (result.status === 'saved_notification_failed') {
        setSavedRequestId(result.requestId)
        setState('EMAIL_ERROR')
        setMessage(`${result.error.message} Su solicitud ${result.requestId} ya esta guardada.`)
        return
      }
      setOpen(false)
      onSuccess(result.requestId, result.notificationReceiptId)
    } catch (error) {
      setState('ERROR')
      setMessage(normalizeAppError(error, 'No se pudo registrar la solicitud de constancia.').message)
    } finally {
      setLoading(false)
    }
  }

  const retryEmail = async () => {
    if (!savedRequestId) return
    setLoading(true)
    setState('EMAIL')
    try {
      const receiptId = await useCase.retryNotification(savedRequestId)
      setOpen(false)
      onSuccess(savedRequestId, receiptId)
    } catch (error) {
      setState('EMAIL_ERROR')
      setMessage(normalizeAppError(error, 'No se pudo procesar el correo de confirmacion.').message)
    } finally {
      setLoading(false)
    }
  }

  return { loading, open, setOpen, state, message, savedRequestId, submit, retryEmail }
}
