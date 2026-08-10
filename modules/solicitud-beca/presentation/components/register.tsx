'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ExternalLink, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { StepperControl } from '@/components/stepper'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import GeneralDialog from '@/components/dialogs/general-dialog'
import MyAlert from '@/components/forms/myAlert'
import SwithField from '@/components/forms/switch.field'
import { finalSchema, IFinalSchema, initialValues } from '@/modules/shared/schemas/final.schema'
import { solicitudBecaSchema } from '@/modules/solicitud-beca/schemas/solicitud-beca.schema'
import useSolicitudBecaStore from '@/modules/solicitud-beca/presentation/solicitud-beca.store'
import { useRegisterSolicitudBeca } from '@/modules/solicitud-beca/presentation/hooks/use-register-solicitud-beca'
import SolicitudSummary from '@/modules/solicitud-beca/presentation/components/solicitud-summary'

type Props = {
  activeStep: number
  steps: string[]
  setActiveStep: React.Dispatch<React.SetStateAction<number>>
}

export default function Register({ activeStep, steps, setActiveStep }: Props) {
  const router = useRouter()
  const workflow = useSolicitudBecaStore((state) => state.workflow)
  const requestResult = solicitudBecaSchema.safeParse({
    email: workflow.draft.email,
    basicData: workflow.draft.basicData,
    documents: workflow.draft.documents,
  })
  const solicitud = requestResult.success ? requestResult.data : null
  const registration = useRegisterSolicitudBeca((requestId, receiptId) => {
    router.push(`/solicitud-beca/finalizar?id=${encodeURIComponent(requestId)}&receipt=${encodeURIComponent(receiptId)}`)
  })
  const form = useForm<IFinalSchema>({ resolver: zodResolver(finalSchema), defaultValues: initialValues })

  const handleDialogOpenChange: React.Dispatch<React.SetStateAction<boolean>> = (nextValue) => {
    const nextOpen = typeof nextValue === 'function' ? nextValue(registration.open) : nextValue
    if (!nextOpen && (registration.loading || registration.dialogState === 'EMAIL_ERROR')) return
    registration.setOpen(nextOpen)
  }

  const onSubmit = async (values: IFinalSchema) => {
    if (!values.info || !values.terminos) {
      toast.error('Confirma los datos y acepta los términos para continuar.')
      return
    }
    if (!solicitud) {
      toast.error('La solicitud no contiene todos los datos y documentos requeridos.')
      return
    }
    await registration.submit(solicitud)
  }

  return (
    <div className="space-y-6">
      <MyAlert
        title="Verifica tus datos"
        description="Revisa que los datos y documentos sean correctos antes de registrar la solicitud."
        type="warning"
      />
      {solicitud ? <SolicitudSummary solicitud={solicitud} /> : (
        <MyAlert
          title="Solicitud incompleta"
          description="Completa los datos básicos y los cinco documentos antes de finalizar."
          type="warning"
        />
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
          <SwithField
            name="info"
            label="Confirmo que los datos son correctos"
            control={form.control}
            description="Los datos consignados son correctos y los documentos adjuntos son verídicos."
          />
          <SwithField
            name="terminos"
            label="Acepto los términos y condiciones"
            control={form.control}
            description="Declaro que conozco el reglamento respecto a becas CIUNAC."
          />
          <div className="flex justify-end">
            <Link
              href="https://ciunac.unac.edu.pe/reglamento/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-blue-500 underline"
            >
              Ver Reglamento <ExternalLink className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <StepperControl
            activeStep={activeStep}
            steps={steps}
            setActiveStep={setActiveStep}
            type="submit"
            disabled={registration.loading || Boolean(registration.savedRequestId)}
          />
        </form>
      </Form>
      <GeneralDialog
        open={registration.open}
        setOpen={handleDialogOpenChange}
        title="Procesando solicitud de beca"
        description={registration.dialogState === 'EMAIL_ERROR' ? 'Solicitud guardada; correo pendiente' : 'Espere por favor'}
      >
        <div className="flex items-center justify-between gap-6 p-4">
          <Image
            src={registration.dialogState === 'ERROR' || registration.dialogState === 'EMAIL_ERROR' ? '/images/error.png' : '/images/save-student.png'}
            alt="Estado del proceso"
            width={100}
            height={100}
          />
          <div className="flex flex-col items-center gap-4">
            {registration.loading ? <Loader2 className="h-12 w-12 animate-spin text-primary" /> : <p>{registration.message}</p>}
            {registration.dialogState === 'EMAIL_ERROR' ? (
              <Button type="button" onClick={registration.retryEmail} disabled={registration.loading}>Reintentar correo</Button>
            ) : null}
          </div>
        </div>
      </GeneralDialog>
    </div>
  )
}
