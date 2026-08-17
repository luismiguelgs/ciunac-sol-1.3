import React from 'react'
import { normalizeAppError } from '@/modules/shared/application/errors/app-error'
import { SolicitudBeca } from '@/modules/solicitud-beca/domain/solicitud-beca'
import {
  registerSolicitudBeca,
  retrySolicitudBecaNotification,
} from '@/modules/solicitud-beca/client'
import useSolicitudBecaStore from '@/modules/solicitud-beca/presentation/solicitud-beca.store'

export type ScholarshipRegisterDialogState = 'SAVE' | 'EMAIL' | 'EMAIL_ERROR' | 'ERROR'

export function useRegisterSolicitudBeca(onSuccess: (requestId: string, receiptId: string) => void) {
  const workflow = useSolicitudBecaStore((state) => state.workflow)
  const beginRegistration = useSolicitudBecaStore((state) => state.beginRegistration)
  const completeRegistration = useSolicitudBecaStore((state) => state.completeRegistration)
  const markNotificationFailed = useSolicitudBecaStore((state) => state.markNotificationFailed)
  const beginNotificationRetry = useSolicitudBecaStore((state) => state.beginNotificationRetry)
  const markRegistrationFailed = useSolicitudBecaStore((state) => state.markRegistrationFailed)
  const [open, setOpen] = React.useState(false)

  const submit = async (solicitud: SolicitudBeca) => {
    if (workflow.status === 'submitting' || workflow.status === 'saved_notification_failed') return
    beginRegistration(solicitud)
    setOpen(true)
    try {
      const result = await registerSolicitudBeca({ solicitud })
      if (result.status === 'saved_notification_failed') {
        markNotificationFailed(result.requestId, result.error)
        return
      }
      completeRegistration(result.requestId, result.notificationReceiptId)
      setOpen(false)
      onSuccess(result.requestId, result.notificationReceiptId)
    } catch (error) {
      markRegistrationFailed(normalizeAppError(error, 'No se pudo registrar la solicitud de beca.'))
    }
  }

  const retryEmail = async () => {
    if (workflow.status !== 'saved_notification_failed') return
    const requestId = workflow.requestId
    beginNotificationRetry(requestId)
    setOpen(true)
    try {
      const receiptId = await retrySolicitudBecaNotification(requestId)
      completeRegistration(requestId, receiptId)
      setOpen(false)
      onSuccess(requestId, receiptId)
    } catch (error) {
      markNotificationFailed(
        requestId,
        normalizeAppError(error, 'No se pudo procesar el correo de confirmación.'),
      )
    }
  }

  const loading = workflow.status === 'submitting'
  const savedRequestId = workflow.status === 'saved_notification_failed'
    || (workflow.status === 'submitting' && workflow.operation === 'notification')
    ? workflow.requestId
    : null
  const dialogState: ScholarshipRegisterDialogState = workflow.status === 'submitting'
    ? workflow.operation === 'notification' ? 'EMAIL' : 'SAVE'
    : workflow.status === 'saved_notification_failed'
      ? 'EMAIL_ERROR'
      : workflow.status === 'error'
        ? 'ERROR'
        : 'SAVE'
  const message = workflow.status === 'saved_notification_failed'
    ? `${workflow.error.message} Su solicitud ${workflow.requestId} ya está guardada.`
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
