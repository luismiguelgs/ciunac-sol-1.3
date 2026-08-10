import React from 'react'
import { normalizeAppError } from '@/modules/shared/application/errors/app-error'
import { SolicitudConstancia } from '@/modules/solicitud-constancia/domain/solicitud-constancia'
import { createRegisterSolicitudConstanciaUseCase } from '@/modules/solicitud-constancia/infrastructure/register-solicitud-constancia.adapters'
import useSolicitudConstanciaStore from '@/modules/solicitud-constancia/presentation/solicitud-constancia.store'

export type ConstanciaRegisterDialogState = 'SAVE' | 'EMAIL' | 'EMAIL_ERROR' | 'ERROR'

export function useRegisterSolicitudConstancia(onSuccess: (requestId: string, receiptId: string) => void) {
  const useCase = React.useMemo(() => createRegisterSolicitudConstanciaUseCase(), [])
  const workflow = useSolicitudConstanciaStore((state) => state.workflow)
  const beginRegistration = useSolicitudConstanciaStore((state) => state.beginRegistration)
  const completeRegistration = useSolicitudConstanciaStore((state) => state.completeRegistration)
  const markNotificationFailed = useSolicitudConstanciaStore((state) => state.markNotificationFailed)
  const beginNotificationRetry = useSolicitudConstanciaStore((state) => state.beginNotificationRetry)
  const markRegistrationFailed = useSolicitudConstanciaStore((state) => state.markRegistrationFailed)
  const [open, setOpen] = React.useState(false)

  const submit = async (solicitud: SolicitudConstancia) => {
    if (workflow.status === 'submitting' || workflow.status === 'saved_notification_failed') return
    beginRegistration(solicitud)
    setOpen(true)
    try {
      const result = await useCase.execute({ solicitud })
      if (result.status === 'saved_notification_failed') {
        markNotificationFailed(result.requestId, result.error)
        return
      }
      completeRegistration(result.requestId, result.notificationReceiptId)
      setOpen(false)
      onSuccess(result.requestId, result.notificationReceiptId)
    } catch (error) {
      markRegistrationFailed(normalizeAppError(error, 'No se pudo registrar la solicitud de constancia.'))
    }
  }

  const retryEmail = async () => {
    if (workflow.status !== 'saved_notification_failed') return
    const requestId = workflow.requestId
    beginNotificationRetry(requestId)
    setOpen(true)
    try {
      const receiptId = await useCase.retryNotification(requestId)
      completeRegistration(requestId, receiptId)
      setOpen(false)
      onSuccess(requestId, receiptId)
    } catch (error) {
      markNotificationFailed(
        requestId,
        normalizeAppError(error, 'No se pudo procesar el correo de confirmacion.'),
      )
    }
  }

  const loading = workflow.status === 'submitting'
  const savedRequestId = workflow.status === 'saved_notification_failed'
    || (workflow.status === 'submitting' && workflow.operation === 'notification')
    ? workflow.requestId
    : null
  const dialogState: ConstanciaRegisterDialogState = workflow.status === 'submitting'
    ? workflow.operation === 'notification' ? 'EMAIL' : 'SAVE'
    : workflow.status === 'saved_notification_failed'
      ? 'EMAIL_ERROR'
      : workflow.status === 'error'
        ? 'ERROR'
        : 'SAVE'
  const message = workflow.status === 'saved_notification_failed'
    ? `${workflow.error.message} Su solicitud ${workflow.requestId} ya esta guardada.`
    : workflow.status === 'error'
      ? workflow.error.message
      : ''

  return {
    loading,
    open,
    setOpen,
    dialogState,
    message,
    savedRequestId,
    submit,
    retryEmail,
  }
}
