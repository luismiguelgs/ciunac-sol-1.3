'use client'

import React from 'react'
import { toast } from 'sonner'
import { Stepper } from '@/components/stepper'
import FinData, { PaymentOption } from '@/modules/shared/components/fin-data'
import { normalizeAppError } from '@/modules/shared/application/errors/app-error'
import { IFinInfoSchema } from '@/modules/shared/schemas/fin-data.schema'
import { useDocumentsStore } from '@/stores/types.stores'
import { ConstanciaBasicDataValues } from '@/modules/solicitud-constancia/schemas/basic-data.schema'
import useSolicitudConstanciaStore from '@/modules/solicitud-constancia/presentation/solicitud-constancia.store'
import {
  toConstanciaBasicData,
  toConstanciaPayment,
} from '@/modules/solicitud-constancia/presentation/solicitud-constancia-form.mapper'
import BasicData from '@/modules/solicitud-constancia/presentation/components/basic-data'
import Register from '@/modules/solicitud-constancia/presentation/components/register'

const STEPS = ['Datos Basicos', 'Datos de Pago', 'Finalizar']

export default function SolicitudConstanciaProcess({ email }: { email: string }) {
  const workflow = useSolicitudConstanciaStore((state) => state.workflow)
  const initialize = useSolicitudConstanciaStore((state) => state.initialize)
  const completeBasicData = useSolicitudConstanciaStore((state) => state.completeBasicData)
  const completePayment = useSolicitudConstanciaStore((state) => state.completePayment)
  const requestTypes = useDocumentsStore((state) => state.data)
  const [activeStep, setActiveStep] = React.useState(0)

  React.useEffect(() => {
    initialize(email)
    setActiveStep(0)
  }, [email, initialize])

  const selectedType = requestTypes.find((item) => item.id === workflow.draft.basicData?.typeId)
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

    try {
      completeBasicData(toConstanciaBasicData(values))
      setActiveStep(1)
    } catch (error) {
      toast.error(normalizeAppError(error, 'Los datos de la constancia no son validos.').message)
    }
  }

  const handlePayment = (values: IFinInfoSchema) => {
    try {
      completePayment(toConstanciaPayment(values))
      setActiveStep(2)
    } catch (error) {
      toast.error(normalizeAppError(error, 'Los datos de pago no son validos.').message)
    }
  }

  const payment = workflow.draft.payment

  return (
    <div className="flex items-center justify-center">
      <Stepper steps={STEPS} activeStep={activeStep}>
        <BasicData
          activeStep={activeStep}
          steps={STEPS}
          setActiveStep={setActiveStep}
          handleNext={handleBasicData}
          defaultData={workflow.draft.basicData}
        />
        <FinData
          activeStep={activeStep}
          steps={STEPS}
          setActiveStep={setActiveStep}
          handleNext={handlePayment}
          documentNumber={workflow.draft.basicData?.documentNumber ?? ''}
          defaultValues={{
            pago: String(payment?.amount ?? amount),
            numero_voucher: payment?.voucher?.number ?? '',
            fecha_pago: payment?.voucher?.paidAt ? new Date(payment.voucher.paidAt) : undefined,
            img_voucher: payment?.voucher?.url ?? '',
          }}
          paymentOptions={paymentOptions}
        />
        <Register activeStep={activeStep} steps={STEPS} setActiveStep={setActiveStep} />
      </Stepper>
    </div>
  )
}
