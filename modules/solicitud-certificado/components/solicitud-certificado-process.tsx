'use client'

import React from 'react'
import { toast } from 'sonner'
import { Stepper } from '@/components/stepper'
import FinData, { PaymentOption } from '@/modules/shared/components/fin-data'
import { normalizeAppError } from '@/modules/shared/application/errors/app-error'
import { IFinInfoSchema } from '@/modules/shared/schemas/fin-data.schema'
import { CertificateCatalogs } from '../model'
import { CertificateBasicDataFormValues } from './basic-data.schema'
import {
  findCertificatePrice,
  toCertificateBasicData,
  toCertificatePayment,
  toCertificatePaymentFormValues,
} from './certificate-form.mapper'
import useSolicitudCertificadoStore from '../store'
import BasicData from './basic-data'
import Register from './register'

const STEPS = ['Datos Básicos', 'Datos de Pago', 'Finalizar']

type Props = { email: string; catalogs: CertificateCatalogs }

export default function SolicitudCertificadoProcess({ email, catalogs }: Props) {
  const workflow = useSolicitudCertificadoStore((state) => state.workflow)
  const initialize = useSolicitudCertificadoStore((state) => state.initialize)
  const completeBasicData = useSolicitudCertificadoStore((state) => state.completeBasicData)
  const completePayment = useSolicitudCertificadoStore((state) => state.completePayment)
  const [activeStep, setActiveStep] = React.useState(0)

  React.useEffect(() => {
    initialize(email)
    setActiveStep(0)
  }, [email, initialize])

  const selectedPrice = findCertificatePrice(workflow.draft.basicData?.typeId, catalogs)
  const paymentOptions: PaymentOption[] = [{
    value: String(selectedPrice),
    label: `S/${selectedPrice.toFixed(2)} - precio normal`,
  }]

  const handleBasicData = (values: CertificateBasicDataFormValues) => {
    try {
      completeBasicData(toCertificateBasicData(values, catalogs))
      setActiveStep(1)
    } catch (error) {
      toast.error(normalizeAppError(error, 'Los datos del certificado no son validos.').message)
    }
  }

  const handlePayment = (values: IFinInfoSchema) => {
    try {
      completePayment(toCertificatePayment(values, selectedPrice))
      setActiveStep(2)
    } catch (error) {
      toast.error(normalizeAppError(error, 'Los datos de pago no son validos.').message)
    }
  }

  return (
    <div className="flex items-center justify-center">
      <Stepper steps={STEPS} activeStep={activeStep}>
        <BasicData
          activeStep={activeStep}
          steps={STEPS}
          catalogs={catalogs}
          defaultData={workflow.draft.basicData}
          setActiveStep={setActiveStep}
          handleNext={handleBasicData}
        />
        <FinData
          activeStep={activeStep}
          setActiveStep={setActiveStep}
          steps={STEPS}
          handleNext={handlePayment}
          documentNumber={workflow.draft.basicData?.documentNumber ?? ''}
          defaultValues={toCertificatePaymentFormValues(workflow.draft.payment)}
          paymentOptions={paymentOptions}
          paymentAttentionText={catalogs.texts.find((item) => item.code === 'TEXTO_1_PAGO')?.content}
        />
        <Register activeStep={activeStep} steps={STEPS} catalogs={catalogs} setActiveStep={setActiveStep} />
      </Stepper>
    </div>
  )
}
