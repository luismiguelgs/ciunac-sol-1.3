import React from 'react'
import { normalizeAppError } from '@/modules/shared/application/errors/app-error'
import { NewStudent } from '@/modules/solicitud-nuevo/domain/new-student'
import { createRegisterNewStudentUseCase } from '@/modules/solicitud-nuevo/application/factories/create-register-new-student-use-case'
import useNewStudentStore, { NewStudentWriteRisk } from '@/modules/solicitud-nuevo/presentation/new-student.store'

export type NewStudentRegisterDialogState = 'SAVE' | 'EMAIL' | 'EMAIL_ERROR' | 'ERROR'

export function useRegisterNewStudent(onSuccess: (receiptId: string) => void) {
  const useCase = React.useMemo(() => createRegisterNewStudentUseCase(), [])
  const workflow = useNewStudentStore((state) => state.workflow)
  const beginRegistration = useNewStudentStore((state) => state.beginRegistration)
  const completeRegistration = useNewStudentStore((state) => state.completeRegistration)
  const markNotificationFailed = useNewStudentStore((state) => state.markNotificationFailed)
  const beginNotificationRetry = useNewStudentStore((state) => state.beginNotificationRetry)
  const markRegistrationFailed = useNewStudentStore((state) => state.markRegistrationFailed)
  const [open, setOpen] = React.useState(false)

  const submit = async (student: NewStudent) => {
    if (
      workflow.status === 'submitting'
      || workflow.status === 'saved_notification_failed'
      || workflow.status === 'success'
      || (workflow.status === 'error' && workflow.writeRisk === 'indeterminate')
    ) return

    beginRegistration(student)
    setOpen(true)
    try {
      const result = await useCase.execute({ student })
      if (result.status === 'saved_notification_failed') {
        markNotificationFailed(result.documentNumber, result.error)
        return
      }
      completeRegistration(result.documentNumber, result.notificationReceiptId)
      setOpen(false)
      onSuccess(result.notificationReceiptId)
    } catch (error) {
      const appError = normalizeAppError(error, 'No se pudo confirmar el registro del estudiante.')
      const writeRisk: NewStudentWriteRisk = appError.code === 'NETWORK' || appError.code === 'EXTERNAL_SERVICE'
        ? 'indeterminate'
        : 'safe_to_retry'
      markRegistrationFailed(appError, writeRisk)
    }
  }

  const retryEmail = async () => {
    if (workflow.status !== 'saved_notification_failed') return
    const documentNumber = workflow.documentNumber
    beginNotificationRetry(documentNumber)
    setOpen(true)
    try {
      const receiptId = await useCase.retryNotification(documentNumber)
      completeRegistration(documentNumber, receiptId)
      setOpen(false)
      onSuccess(receiptId)
    } catch (error) {
      markNotificationFailed(
        documentNumber,
        normalizeAppError(error, 'No se pudo procesar el correo de confirmacion.'),
      )
    }
  }

  const loading = workflow.status === 'submitting'
  const writeBlocked = workflow.status === 'saved_notification_failed'
    || workflow.status === 'success'
    || (workflow.status === 'error' && workflow.writeRisk === 'indeterminate')
  const dialogState: NewStudentRegisterDialogState = workflow.status === 'submitting'
    ? workflow.operation === 'notification' ? 'EMAIL' : 'SAVE'
    : workflow.status === 'saved_notification_failed'
      ? 'EMAIL_ERROR'
      : workflow.status === 'error'
        ? 'ERROR'
        : 'SAVE'
  const message = workflow.status === 'saved_notification_failed'
    ? `${workflow.error.message} El estudiante con documento ${workflow.documentNumber} ya fue registrado.`
    : workflow.status === 'error'
      ? workflow.writeRisk === 'indeterminate'
        ? `${workflow.error.message} No vuelva a enviar el formulario; comuníquese con CIUNAC para confirmar el registro.`
        : workflow.error.message
      : ''

  return {
    workflow,
    loading,
    writeBlocked,
    open,
    setOpen,
    dialogState,
    message,
    submit,
    retryEmail,
  }
}
