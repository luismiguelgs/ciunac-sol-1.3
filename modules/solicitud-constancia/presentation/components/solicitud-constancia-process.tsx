'use client'

import React from 'react'
import { toast } from 'sonner'
import { Stepper } from '@/components/stepper'
import FinData, { PaymentOption } from '@/modules/shared/components/fin-data'
import { IFinInfoSchema } from '@/modules/shared/schemas/fin-data.schema'
import { useDocumentsStore } from '@/stores/types.stores'
import { ConstanciaBasicDataValues } from '@/modules/solicitud-constancia/schemas/basic-data.schema'
import useSolicitudConstanciaStore from '@/modules/solicitud-constancia/presentation/solicitud-constancia.store'
import BasicData from '@/modules/solicitud-constancia/presentation/components/basic-data'
import Register from '@/modules/solicitud-constancia/presentation/components/register'

const STEPS = ['Datos Basicos', 'Datos de Pago', 'Finalizar']

export default function SolicitudConstanciaProcess({ email }: { email: string }) {
  const { draft, updateDraft, reset } = useSolicitudConstanciaStore()
  const requestTypes = useDocumentsStore((state) => state.data)
  const [activeStep, setActiveStep] = React.useState(0)

  React.useEffect(() => {
    reset(email)
    setActiveStep(0)
  }, [email, reset])

  const selectedType = requestTypes.find((item) => item.id === draft.tipoSolicitudId)
  const amount = Number(selectedType?.precio ?? 0)
  const paymentOptions = React.useMemo<PaymentOption[]>(
    () => [{ value: String(amount), label: `S/${amount.toFixed(2)} - precio normal` }],
    [amount],
  )

  const handleBasicData = (values: ConstanciaBasicDataValues) => {
    const requestType = requestTypes.find((item) => item.id === Number(values.tipo_solicitud))
    if (!requestType || !Number.isFinite(Number(requestType.precio)) || Number(requestType.precio) < 0) {
      toast.error('No se pudo resolver el precio de la constancia. Intente nuevamente.')
      return
    }

    updateDraft({
      email,
      tipoSolicitudId: Number(values.tipo_solicitud),
      idiomaId: Number(values.idioma),
      nivelId: Number(values.nivel),
      nombres: values.nombres,
      apellidos: values.apellidos,
      tipoDocumento: values.tipo_documento,
      numeroDocumento: values.dni,
      celular: values.celular,
      estudianteId: values.estudianteId || undefined,
      alumnoUnac: values.estudiante,
      facultadId: values.estudiante && values.facultad ? Number(values.facultad) : undefined,
      escuelaId: values.estudiante && values.escuela ? Number(values.escuela) : undefined,
      codigo: values.estudiante ? values.codigo : undefined,
    })
    setActiveStep(1)
  }

  const handlePayment = (values: IFinInfoSchema) => {
    updateDraft({
      pago: Number(values.pago),
      numeroVoucher: values.numero_voucher || undefined,
      fechaPago: values.fecha_pago?.toISOString(),
      voucherUrl: values.img_voucher || undefined,
    })
    setActiveStep(2)
  }

  return (
    <div className="flex items-center justify-center">
      <Stepper steps={STEPS} activeStep={activeStep}>
        <BasicData
          activeStep={activeStep}
          steps={STEPS}
          setActiveStep={setActiveStep}
          handleNext={handleBasicData}
        />
        <FinData
          activeStep={activeStep}
          steps={STEPS}
          setActiveStep={setActiveStep}
          handleNext={handlePayment}
          documentNumber={draft.numeroDocumento ?? ''}
          defaultValues={{
            pago: String(draft.pago ?? amount),
            numero_voucher: draft.numeroVoucher ?? '',
            fecha_pago: draft.fechaPago ? new Date(draft.fechaPago) : undefined,
            img_voucher: draft.voucherUrl ?? '',
          }}
          paymentOptions={paymentOptions}
        />
        <Register activeStep={activeStep} steps={STEPS} setActiveStep={setActiveStep} />
      </Stepper>
    </div>
  )
}
