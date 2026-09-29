'use client'

import React from 'react'
import { toast } from 'sonner'
import { Stepper } from '@/components/stepper'
import FinData, { PaymentOption } from '@/modules/shared/components/fin-data'
import { normalizeAppError } from '@/modules/shared/application/errors/app-error'
import { IFinInfoSchema } from '@/modules/shared/schemas/fin-data.schema'
import type { ConstanciaCatalogs } from '../model'
import type { ConstanciaBasicDataFormValues } from './basic-data.schema'
import useSolicitudConstanciaStore from '../store'
import {
  findConstanciaPrice,
  toConstanciaBasicData,
  toConstanciaPayment,
  toConstanciaPaymentFormValues,
} from './constancia-form.mapper'
import BasicData from './basic-data'
import Register from './register'

const STEPS = ['Datos Basicos', 'Datos de Pago', 'Finalizar']

type Props = { email: string; catalogs: ConstanciaCatalogs }

export default function SolicitudConstanciaProcess({ email, catalogs }: Props) {
  const workflow = useSolicitudConstanciaStore((state) => state.workflow)
  const initialize = useSolicitudConstanciaStore((state) => state.initialize)
  const completeBasicData = useSolicitudConstanciaStore((state) => state.completeBasicData)
  const completePayment = useSolicitudConstanciaStore((state) => state.completePayment)
  const [activeStep, setActiveStep] = React.useState(0)

  React.useEffect(() => {
    initialize(email)
    setActiveStep(0)
  }, [email, initialize])

  const amount = findConstanciaPrice(workflow.draft.basicData?.typeId, catalogs)
  const paymentOptions: PaymentOption[] = [{
    value: String(amount),
    label: `S/${amount.toFixed(2)} - precio normal`,
  }]

  const handleBasicData = (values: ConstanciaBasicDataFormValues) => {
    try {
      completeBasicData(toConstanciaBasicData(values, catalogs))
      setActiveStep(1)
    } catch (error) {
      toast.error(normalizeAppError(error, 'Los datos de la constancia no son validos.').message)
    }
  }

  const handlePayment = (values: IFinInfoSchema) => {
    try {
      completePayment(toConstanciaPayment(values, amount))
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
          catalogs={catalogs}
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
          defaultValues={payment ? toConstanciaPaymentFormValues(payment) : { pago: String(amount) }}
          paymentOptions={paymentOptions}
          paymentAttentionText={catalogs.texts.find((item) => item.code === 'TEXTO_1_PAGO')?.content}
        />
        <Register activeStep={activeStep} steps={STEPS} catalogs={catalogs} setActiveStep={setActiveStep} />
      </Stepper>
    </div>
  )
}
