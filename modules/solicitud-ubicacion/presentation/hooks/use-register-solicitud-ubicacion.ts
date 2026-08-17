import React from 'react'
import { normalizeAppError } from '@/modules/shared/application/errors/app-error'
import {
  registerSolicitudUbicacion,
  retrySolicitudUbicacionNotification,
} from '@/modules/solicitud-ubicacion/client'
import { SolicitudUbicacion } from '@/modules/solicitud-ubicacion/domain/solicitud-ubicacion'
import useSolicitudUbicacionStore from '@/modules/solicitud-ubicacion/presentation/solicitud-ubicacion.store'

export type LocationRegisterDialogState = 'SAVE' | 'EMAIL' | 'EMAIL_ERROR' | 'ERROR'

export function useRegisterSolicitudUbicacion(onSuccess: (requestId: string, receiptId: string) => void) {
  const workflow = useSolicitudUbicacionStore((state) => state.workflow)
  const beginRegistration = useSolicitudUbicacionStore((state) => state.beginRegistration)
  const completeRegistration = useSolicitudUbicacionStore((state) => state.completeRegistration)
  const markNotificationFailed = useSolicitudUbicacionStore((state) => state.markNotificationFailed)
  const beginNotificationRetry = useSolicitudUbicacionStore((state) => state.beginNotificationRetry)
  const markRegistrationFailed = useSolicitudUbicacionStore((state) => state.markRegistrationFailed)
  const [open, setOpen] = React.useState(false)

  const submit = async (solicitud: SolicitudUbicacion) => {
    if (workflow.status === 'submitting' || workflow.status === 'saved_notification_failed') return
    beginRegistration(solicitud)
    setOpen(true)
    try {
      const result = await registerSolicitudUbicacion({ solicitud })
      if (result.status === 'saved_notification_failed') {
        markNotificationFailed(result.requestId, result.error)
        return
      }
      completeRegistration(result.requestId, result.notificationReceiptId)
      setOpen(false)
      onSuccess(result.requestId, result.notificationReceiptId)
    } catch (error) {
      markRegistrationFailed(normalizeAppError(error, 'No se pudo registrar la solicitud de ubicacion.'))
    }
  }

  const retryEmail = async () => {
    if (workflow.status !== 'saved_notification_failed') return
    const requestId = workflow.requestId
    beginNotificationRetry(requestId)
    setOpen(true)
    try {
      const receiptId = await retrySolicitudUbicacionNotification(requestId)
      completeRegistration(requestId, receiptId)
      setOpen(false)
      onSuccess(requestId, receiptId)
    } catch (error) {
      markNotificationFailed(requestId, normalizeAppError(error, 'No se pudo procesar el correo de confirmacion.'))
    }
  }

  const loading = workflow.status === 'submitting'
  const savedRequestId = workflow.status === 'saved_notification_failed'
    || (workflow.status === 'submitting' && workflow.operation === 'notification')
    ? workflow.requestId
    : null
  const dialogState: LocationRegisterDialogState = workflow.status === 'submitting'
    ? workflow.operation === 'notification' ? 'EMAIL' : 'SAVE'
    : workflow.status === 'saved_notification_failed'
      ? 'EMAIL_ERROR'
      : workflow.status === 'error'
        ? 'ERROR'
        : 'SAVE'
  const message = workflow.status === 'saved_notification_failed'
    ? `${workflow.error.message} Su solicitud ${workflow.requestId} ya esta guardada.`
    : workflow.status === 'error' ? workflow.error.message : ''

  return { loading, open, setOpen, dialogState, message, savedRequestId, submit, retryEmail }
}
