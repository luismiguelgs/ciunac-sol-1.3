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
import { LocationCatalogs } from '@/modules/solicitud-ubicacion/domain/solicitud-ubicacion'
import { solicitudUbicacionDomainSchema } from '@/modules/solicitud-ubicacion/schemas/solicitud-ubicacion-domain.schema'
import useSolicitudUbicacionStore from '@/modules/solicitud-ubicacion/presentation/solicitud-ubicacion.store'
import { useRegisterSolicitudUbicacion } from '@/modules/solicitud-ubicacion/presentation/hooks/use-register-solicitud-ubicacion'
import SolicitudSummary from '@/modules/solicitud-ubicacion/presentation/components/solicitud-summary'

type Props = {
  activeStep: number
  steps: string[]
  catalogs: LocationCatalogs
  setActiveStep: React.Dispatch<React.SetStateAction<number>>
}

export default function Register({ activeStep, steps, catalogs, setActiveStep }: Props) {
  const router = useRouter()
  const workflow = useSolicitudUbicacionStore((state) => state.workflow)
  const result = solicitudUbicacionDomainSchema.safeParse(workflow.draft)
  const solicitud = result.success ? result.data : null
  const registration = useRegisterSolicitudUbicacion((requestId, receiptId) => {
    router.push(`/solicitud-ubicacion/finalizar?id=${encodeURIComponent(requestId)}&receipt=${encodeURIComponent(receiptId)}`)
  })
  const form = useForm<IFinalSchema>({ resolver: zodResolver(finalSchema), defaultValues: initialValues })
  const verificationText = findText(catalogs, 'TEXTO_UBICACION_3')
    ?? 'Revise cuidadosamente los datos antes de registrar la solicitud.'
  const disclaimerText = findText(catalogs, 'TEXTO_UBICACION_4')
    ?? 'Conserve el cargo generado al finalizar el proceso.'

  const handleDialogOpenChange: React.Dispatch<React.SetStateAction<boolean>> = (nextValue) => {
    const nextOpen = typeof nextValue === 'function' ? nextValue(registration.open) : nextValue
    if (!nextOpen && (registration.loading || registration.dialogState === 'EMAIL_ERROR')) return
    registration.setOpen(nextOpen)
  }

  const onSubmit = async (values: IFinalSchema) => {
    if (!values.info || !values.terminos) {
      toast.error('Confirme los datos y acepte los terminos para continuar.')
      return
    }
    if (!solicitud) {
      toast.error('La solicitud no contiene todos los datos requeridos.')
      return
    }
    await registration.submit(solicitud)
  }

  return (
    <div className="space-y-6">
      <MyAlert title="Verifica tus datos" description={verificationText} type="warning" />
      {solicitud ? <SolicitudSummary solicitud={solicitud} catalogs={catalogs} /> : (
        <MyAlert title="Solicitud incompleta" description="Complete todos los pasos antes de finalizar." type="warning" />
      )}
      <MyAlert title="Importante" description={disclaimerText} type="warning" />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
          <SwithField name="info" label="Confirmo que los datos son correctos" control={form.control} description="Los datos y documentos consignados son veridicos." />
          <SwithField name="terminos" label="Acepto los terminos y condiciones" control={form.control} description="Declaro que conozco el reglamento del examen de ubicacion CIUNAC." />
          <div className="flex justify-end">
            <Link href="https://ciunac.unac.edu.pe/reglamento/" target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-500 underline">
              Ver Reglamento <ExternalLink className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <StepperControl activeStep={activeStep} steps={steps} setActiveStep={setActiveStep} type="submit" disabled={registration.loading || Boolean(registration.savedRequestId)} />
        </form>
      </Form>
      <GeneralDialog
        open={registration.open}
        setOpen={handleDialogOpenChange}
        title="Procesando solicitud de ubicacion"
        description={registration.dialogState === 'EMAIL_ERROR' ? 'Solicitud guardada; correo pendiente' : 'Espere por favor'}
      >
        <div className="flex items-center justify-between gap-6 p-4">
          <Image src={registration.dialogState === 'ERROR' || registration.dialogState === 'EMAIL_ERROR' ? '/images/error.png' : '/images/save-student.png'} alt="Estado del proceso" width={100} height={100} />
          <div className="flex flex-col items-center gap-4">
            {registration.loading ? <Loader2 className="h-12 w-12 animate-spin text-primary" /> : <p>{registration.message}</p>}
            {registration.dialogState === 'EMAIL_ERROR' ? <Button type="button" onClick={registration.retryEmail} disabled={registration.loading}>Reintentar correo</Button> : null}
          </div>
        </div>
      </GeneralDialog>
    </div>
  )
}

function findText(catalogs: LocationCatalogs, code: string): string | undefined {
  return catalogs.texts.find((item) => item.code === code)?.content
}
