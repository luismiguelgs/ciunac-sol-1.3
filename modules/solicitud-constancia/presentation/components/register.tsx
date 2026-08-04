import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ExternalLink, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { StepperControl } from '@/components/stepper'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import SwithField from '@/components/forms/switch.field'
import MyAlert from '@/components/forms/myAlert'
import GeneralDialog from '@/components/dialogs/general-dialog'
import { finalSchema, IFinalSchema, initialValues } from '@/modules/shared/schemas/final.schema'
import { SolicitudConstanciaDraft } from '@/modules/solicitud-constancia/domain/solicitud-constancia'
import useSolicitudConstanciaStore from '@/modules/solicitud-constancia/presentation/solicitud-constancia.store'
import { useRegisterSolicitudConstancia } from '@/modules/solicitud-constancia/presentation/use-register-solicitud-constancia'
import SolicitudSummary from '@/modules/solicitud-constancia/presentation/components/solicitud-summary'

type Props = {
  activeStep: number
  steps: string[]
  setActiveStep: React.Dispatch<React.SetStateAction<number>>
}

export default function Register({ activeStep, steps, setActiveStep }: Props) {
  const router = useRouter()
  const draft = useSolicitudConstanciaStore((state) => state.draft)
  const completeDraft = toCompleteDraft(draft)
  const registration = useRegisterSolicitudConstancia((requestId, receiptId) => {
    router.push(`/solicitud-constancias/finalizar?id=${requestId}&receipt=${receiptId}`)
  })
  const form = useForm<IFinalSchema>({ resolver: zodResolver(finalSchema), defaultValues: initialValues })

  const onSubmit = async (values: IFinalSchema) => {
    if (!values.info || !values.terminos) {
      toast.error('Confirme los datos y acepte los terminos para continuar.')
      return
    }
    if (!completeDraft) {
      toast.error('La solicitud no contiene todos los datos requeridos.')
      return
    }
    await registration.submit(completeDraft)
  }

  return (
    <div className="space-y-6">
      <MyAlert
        title="Verifica tus datos"
        description="Revise la informacion antes de registrar su solicitud de constancia."
        type="warning"
      />
      {completeDraft ? <SolicitudSummary draft={completeDraft} /> : null}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
          <SwithField
            name="info"
            label="Confirmo que los datos son correctos"
            control={form.control}
          />
          <SwithField
            name="terminos"
            label="Acepto los terminos y condiciones"
            control={form.control}
            description="Declaro que conozco el reglamento para solicitudes de constancias CIUNAC."
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
        setOpen={registration.setOpen}
        title="Procesando solicitud de constancia"
        description={registration.state === 'EMAIL_ERROR' ? 'Solicitud guardada; correo pendiente' : 'Espere por favor'}
      >
        <div className="flex items-center justify-between gap-6 p-4">
          <Image
            src={registration.state === 'ERROR' || registration.state === 'EMAIL_ERROR' ? '/images/error.png' : '/images/save-student.png'}
            alt="Estado del proceso"
            width={100}
            height={100}
          />
          <div className="flex flex-col items-center gap-4">
            {registration.loading ? <Loader2 className="h-12 w-12 animate-spin text-primary" /> : <p>{registration.message}</p>}
            {registration.state === 'EMAIL_ERROR' ? (
              <Button type="button" onClick={registration.retryEmail} disabled={registration.loading}>Reintentar correo</Button>
            ) : null}
          </div>
        </div>
      </GeneralDialog>
    </div>
  )
}

function toCompleteDraft(draft: Partial<SolicitudConstanciaDraft>): SolicitudConstanciaDraft | null {
  if (
    !draft.email || !draft.tipoSolicitudId || !draft.idiomaId || !draft.nivelId
    || !draft.nombres || !draft.apellidos || !draft.tipoDocumento
    || !draft.numeroDocumento || !draft.celular || draft.pago === undefined
  ) return null

  if (draft.pago > 0 && (!draft.numeroVoucher || !draft.fechaPago || !draft.voucherUrl)) return null
  if (draft.alumnoUnac && (!draft.facultadId || !draft.escuelaId || !draft.codigo)) return null
  return draft as SolicitudConstanciaDraft
}
