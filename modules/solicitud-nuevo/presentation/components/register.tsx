'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import GeneralDialog from '@/components/dialogs/general-dialog'
import MyAlert from '@/components/forms/myAlert'
import SwithField from '@/components/forms/switch.field'
import { StepperControl } from '@/components/stepper'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { finalSchema, IFinalSchema, initialValues } from '@/modules/shared/schemas/final.schema'
import { newStudentSchema } from '@/modules/solicitud-nuevo/application/validation/new-student.schema'
import useNewStudentStore from '@/modules/solicitud-nuevo/presentation/new-student.store'
import { useRegisterNewStudent } from '@/modules/solicitud-nuevo/presentation/hooks/use-register-new-student'
import NewStudentSummary from '@/modules/solicitud-nuevo/presentation/components/new-student-summary'

type Props = {
  activeStep: number
  setActiveStep: React.Dispatch<React.SetStateAction<number>>
  steps: string[]
}

export default function Register({ activeStep, setActiveStep, steps }: Props) {
  const router = useRouter()
  const workflow = useNewStudentStore((state) => state.workflow)
  const studentResult = newStudentSchema.safeParse({
    email: workflow.draft.email,
    ...workflow.draft.basicData,
  })
  const student = studentResult.success ? studentResult.data : null
  const registration = useRegisterNewStudent((receiptId) => {
    router.push(`/solicitud-nuevo/finalizar?receipt=${encodeURIComponent(receiptId)}`)
  })
  const form = useForm<IFinalSchema>({ resolver: zodResolver(finalSchema), defaultValues: initialValues })
  const acceptsData = useWatch({ control: form.control, name: 'info' })
  const acceptsTerms = useWatch({ control: form.control, name: 'terminos' })
  const canSubmit = Boolean(student && acceptsData && acceptsTerms)

  const handleDialogOpenChange: React.Dispatch<React.SetStateAction<boolean>> = (nextValue) => {
    const nextOpen = typeof nextValue === 'function' ? nextValue(registration.open) : nextValue
    if (!nextOpen && (registration.loading || registration.dialogState === 'EMAIL_ERROR')) return
    registration.setOpen(nextOpen)
  }

  const onSubmit = async () => {
    if (!student || !canSubmit) return
    await registration.submit(student)
  }

  return (
    <div className="space-y-6">
      <MyAlert
        title="Verificación de datos"
        description="Verifique cuidadosamente la información antes de registrar al alumno en Q10. Recibirá un correo con los accesos y manuales para continuar."
      />
      <MyAlert
        title="Soporte del proceso"
        type="error"
        description={(
          <>
            Si la información no es correcta o no recibe el correo, revise la carpeta de no deseados y contacte a{' '}
            <Link href="mailto:ciunac.alumnosnuevos@unac.edu.pe">ciunac.alumnosnuevos@unac.edu.pe</Link>.
          </>
        )}
      />
      {student ? <NewStudentSummary student={student} /> : (
        <MyAlert title="Registro incompleto" type="warning" description="Complete la verificación y los datos básicos antes de finalizar." />
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
          <div>
            <h3 className="mb-4 text-lg font-medium">Formulario de consentimiento</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <SwithField control={form.control} name="info" label="Los datos proporcionados son los correctos" description="Marque si los datos indicados son correctos" />
              <SwithField control={form.control} name="terminos" label="Acepta todos los términos y condiciones" description="Marque si acepta todos los términos y condiciones" />
            </div>
          </div>
          <StepperControl
            activeStep={activeStep}
            steps={steps}
            setActiveStep={setActiveStep}
            type="submit"
            disabledPrevious={registration.loading || registration.writeBlocked}
            disabledNext={registration.loading || registration.writeBlocked || !canSubmit}
          />
        </form>
      </Form>
      <GeneralDialog
        open={registration.open}
        setOpen={handleDialogOpenChange}
        title="Estado del registro"
        description={registration.dialogState === 'EMAIL_ERROR' ? 'Estudiante guardado; correo pendiente' : registration.dialogState === 'EMAIL' ? 'Enviando correo electrónico' : registration.dialogState === 'SAVE' ? 'Guardando información' : 'Error al procesar el registro'}
      >
        <div className="flex items-center justify-between gap-6 p-4">
          <Image
            src={registration.dialogState === 'EMAIL' ? '/images/send-email.png' : registration.dialogState === 'SAVE' ? '/images/save-student.png' : '/images/error.png'}
            alt="Estado del proceso"
            width={120}
            height={120}
            className="flex-shrink-0"
          />
          <div className="flex flex-col items-center space-y-4">
            {registration.loading ? (
              <><Loader2 className="h-16 w-16 animate-spin text-primary" /><span className="text-sm text-muted-foreground">Espere por favor, estamos procesando el registro.</span></>
            ) : (
              <>
                <span className="text-sm font-bold text-muted-foreground">{registration.message}</span>
                <div className="flex gap-2">
                  {registration.dialogState === 'EMAIL_ERROR' ? <Button type="button" onClick={registration.retryEmail}>Reintentar correo</Button> : null}
                  <Button type="button" variant="outline" onClick={() => registration.setOpen(false)}>Cerrar</Button>
                </div>
              </>
            )}
          </div>
        </div>
      </GeneralDialog>
    </div>
  )
}
