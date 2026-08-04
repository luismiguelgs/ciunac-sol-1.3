'use client'

import React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import GeneralDialog from '@/components/dialogs/general-dialog'
import SwithField from '@/components/forms/switch.field'
import { StepperControl } from '@/components/stepper'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { normalizeAppError } from '@/modules/shared/application/errors/app-error'
import { createRegisterNewStudentUseCase } from '@/modules/solicitud-nuevo/application/factories/create-register-new-student-use-case'
import IStudent from '@/modules/solicitud-nuevo/interfaces/student.interface'

const FormSchema = z.object({
  accept: z.boolean(),
  data: z.boolean(),
})

type Props = {
  activeStep: number
  setActiveStep: React.Dispatch<React.SetStateAction<number>>
  steps: string[]
  student: IStudent
}

type ProcessState = 'SAVE' | 'EMAIL' | 'EMAIL_ERROR' | 'ERROR'

export function FinishForm({ activeStep, setActiveStep, steps, student }: Props) {
  const router = useRouter()
  const useCase = React.useMemo(() => createRegisterNewStudentUseCase(), [])
  const [state, setState] = React.useState<ProcessState>('SAVE')
  const [message, setMessage] = React.useState<React.ReactNode>('')
  const [loading, setLoading] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const [studentSaved, setStudentSaved] = React.useState(false)
  const [writeBlocked, setWriteBlocked] = React.useState(false)

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { accept: false, data: false },
  })

  const accept = useWatch({ control: form.control, name: 'accept' })
  const dataAccepted = useWatch({ control: form.control, name: 'data' })
  const canSubmit = Boolean(accept && dataAccepted)

  const complete = (receiptId: string) => {
    setOpen(false)
    router.push(`/solicitud-nuevo/finalizar?receipt=${receiptId}`)
  }

  async function onSubmit() {
    if (studentSaved || writeBlocked) return
    setLoading(true)
    setState('SAVE')
    setOpen(true)

    try {
      const result = await useCase.execute(student)
      setStudentSaved(true)

      if (result.status === 'saved_notification_failed') {
        setState('EMAIL_ERROR')
        setMessage(`${result.error.message} El estudiante ya fue registrado; no vuelva a enviar el formulario.`)
        return
      }

      complete(result.notificationReceiptId)
    } catch (error) {
      const appError = normalizeAppError(error, 'No se pudo confirmar el registro del estudiante.')
      setWriteBlocked(appError.code === 'NETWORK' || appError.code === 'EXTERNAL_SERVICE')
      setState('ERROR')
      setMessage(`${appError.message} Si el problema persiste, comuniquese con ciunac.alumnosnuevos@unac.edu.pe.`)
    } finally {
      setLoading(false)
    }
  }

  async function retryEmail() {
    if (!studentSaved) return
    setLoading(true)
    setState('EMAIL')
    setOpen(true)
    try {
      const receiptId = await useCase.retryNotification(student)
      complete(receiptId)
    } catch (error) {
      const appError = normalizeAppError(error, 'No se pudo procesar el correo de confirmacion.')
      setState('EMAIL_ERROR')
      setMessage(`${appError.message} El estudiante ya fue registrado; no vuelva a enviar el formulario.`)
    } finally {
      setLoading(false)
    }
  }

  const processing = state === 'SAVE' || state === 'EMAIL'

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
          <div>
            <h3 className="mb-4 text-lg font-medium">Formulario de consentimiento</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <SwithField
                control={form.control}
                name="accept"
                label="Los datos proporcionados son los correctos"
                description="Marcar si los datos indicados lineas arriba son los correctos"
              />
              <SwithField
                control={form.control}
                name="data"
                label="Acepta todos los terminos y condiciones"
                description="Marcar si acepta todos los terminos y condiciones"
              />
            </div>
          </div>
          <StepperControl
            activeStep={activeStep}
            steps={steps}
            setActiveStep={setActiveStep}
            type="submit"
            disabledPrevious={loading || studentSaved || writeBlocked}
            disabledNext={loading || studentSaved || writeBlocked || !canSubmit}
          />
        </form>
      </Form>
      <GeneralDialog
        open={open}
        setOpen={setOpen}
        title="Estado del registro"
        description={state === 'EMAIL_ERROR' ? 'Estudiante guardado; correo pendiente' : state === 'EMAIL' ? 'Enviando correo electronico' : state === 'SAVE' ? 'Guardando informacion' : 'Error al procesar el registro'}
      >
        <div className="flex items-center justify-between gap-6 p-4">
          <Image
            src={state === 'EMAIL' ? '/images/send-email.png' : state === 'SAVE' ? '/images/save-student.png' : '/images/error.png'}
            alt="Estado del proceso"
            width={120}
            height={120}
            className="flex-shrink-0"
          />
          <div className="flex flex-col items-center space-y-4">
            {processing ? (
              <>
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Espere por favor, estamos procesando el registro.</span>
              </>
            ) : (
              <>
                <span className="text-sm font-bold text-muted-foreground">{message}</span>
                <div className="flex gap-2">
                  {state === 'EMAIL_ERROR' ? (
                    <Button type="button" onClick={retryEmail} disabled={loading}>Reintentar correo</Button>
                  ) : null}
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cerrar</Button>
                </div>
              </>
            )}
          </div>
        </div>
      </GeneralDialog>
    </>
  )
}
