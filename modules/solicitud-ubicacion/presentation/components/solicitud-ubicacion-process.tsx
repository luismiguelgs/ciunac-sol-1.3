'use client'

import React from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { Stepper } from '@/components/stepper'
import GeneralDialog from '@/components/dialogs/general-dialog'
import FinData, { PaymentOption } from '@/modules/shared/components/fin-data'
import { normalizeAppError } from '@/modules/shared/application/errors/app-error'
import { IFinInfoSchema } from '@/modules/shared/schemas/fin-data.schema'
import { LOCATION_EXAM_PRICE, LocationCatalogs } from '@/modules/solicitud-ubicacion/domain/solicitud-ubicacion'
import { checkDuplicateSolicitudUbicacion } from '@/modules/solicitud-ubicacion/client'
import { LocationBasicDataFormValues } from '@/modules/solicitud-ubicacion/presentation/schemas/location-basic-data.schema'
import { LocationDocumentsFormValues } from '@/modules/solicitud-ubicacion/presentation/schemas/location-documents.schema'
import {
  toLocationBasicData,
  toLocationPayment,
  toLocationPaymentFormValues,
} from '@/modules/solicitud-ubicacion/presentation/location-form.mapper'
import useSolicitudUbicacionStore from '@/modules/solicitud-ubicacion/presentation/solicitud-ubicacion.store'
import BasicData from '@/modules/solicitud-ubicacion/presentation/components/basic-data'
import StudyCertificate from '@/modules/solicitud-ubicacion/presentation/components/study-certificate'
import Register from '@/modules/solicitud-ubicacion/presentation/components/register'

type Props = { email: string; isCiunacStudent: boolean; catalogs: LocationCatalogs }

export default function SolicitudUbicacionProcess({ email, isCiunacStudent, catalogs }: Props) {
  const workflow = useSolicitudUbicacionStore((state) => state.workflow)
  const initialize = useSolicitudUbicacionStore((state) => state.initialize)
  const completeBasicData = useSolicitudUbicacionStore((state) => state.completeBasicData)
  const completePayment = useSolicitudUbicacionStore((state) => state.completePayment)
  const completeStudyCertificate = useSolicitudUbicacionStore((state) => state.completeStudyCertificate)
  const [activeStep, setActiveStep] = React.useState(0)
  const [duplicateDialog, setDuplicateDialog] = React.useState(false)
  const steps = isCiunacStudent
    ? ['Datos basicos', 'Datos de pago', 'Documentos', 'Finalizar']
    : ['Datos basicos', 'Datos de pago', 'Finalizar']
  const paymentOptions: PaymentOption[] = [{
    value: String(LOCATION_EXAM_PRICE),
    label: `S/${LOCATION_EXAM_PRICE.toFixed(2)} - precio normal`,
  }]

  React.useEffect(() => {
    initialize(email, isCiunacStudent)
    setActiveStep(0)
  }, [email, initialize, isCiunacStudent])

  const handleBasicData = async (values: LocationBasicDataFormValues) => {
    try {
      const basicData = toLocationBasicData(values, catalogs, isCiunacStudent)
      const duplicate = await checkDuplicateSolicitudUbicacion({
        documentNumber: basicData.documentNumber,
        languageId: basicData.languageId,
      })
      if (duplicate) {
        setDuplicateDialog(true)
        return
      }
      completeBasicData(basicData)
      setActiveStep(1)
    } catch (error) {
      toast.error(normalizeAppError(error, 'No se pudo verificar la solicitud de ubicacion.').message)
    }
  }

  const handlePayment = (values: IFinInfoSchema) => {
    try {
      completePayment(toLocationPayment(values))
      setActiveStep(2)
    } catch (error) {
      toast.error(normalizeAppError(error, 'Los datos de pago no son validos.').message)
    }
  }

  const handleStudyCertificate = (values: LocationDocumentsFormValues) => {
    completeStudyCertificate(values.studyCertificateUrl)
    setActiveStep(3)
  }

  const stepContent: React.ReactNode[] = [
    <BasicData
      key="basic-data"
      activeStep={activeStep}
      steps={steps}
      catalogs={catalogs}
      defaultData={workflow.draft.basicData}
      isCiunacStudent={isCiunacStudent}
      setActiveStep={setActiveStep}
      handleNext={handleBasicData}
    />,
    <FinData
      key="payment"
      activeStep={activeStep}
      setActiveStep={setActiveStep}
      steps={steps}
      handleNext={handlePayment}
      documentNumber={workflow.draft.basicData?.documentNumber ?? ''}
      defaultValues={toLocationPaymentFormValues(workflow.draft.payment)}
      paymentOptions={paymentOptions}
    />,
  ]
  if (isCiunacStudent) {
    stepContent.push(
      <StudyCertificate
        key="study-certificate"
        activeStep={activeStep}
        steps={steps}
        documentNumber={workflow.draft.basicData?.documentNumber ?? ''}
        defaultUrl={workflow.draft.studyCertificateUrl}
        texts={catalogs.texts}
        setActiveStep={setActiveStep}
        handleNext={handleStudyCertificate}
      />,
    )
  }
  stepContent.push(
    <Register
      key="register"
      activeStep={activeStep}
      steps={steps}
      catalogs={catalogs}
      setActiveStep={setActiveStep}
    />,
  )

  return (
    <div className="flex items-center justify-center">
      <Stepper steps={steps} activeStep={activeStep}>
        {stepContent}
      </Stepper>
      <GeneralDialog open={duplicateDialog} setOpen={setDuplicateDialog} title="Solicitud en proceso">
        <div className="space-y-4 text-center">
          <Image src="/images/error.png" alt="Advertencia" width={90} height={90} className="mx-auto" />
          <p>Ya existe una solicitud en proceso para el mismo documento e idioma. Espere su finalizacion antes de registrar otra.</p>
        </div>
      </GeneralDialog>
    </div>
  )
}
