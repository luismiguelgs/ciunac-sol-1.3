'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form } from '@/components/ui/form'
import { StepperControl } from '@/components/stepper'
import MyAlert from '@/components/forms/myAlert'
import UploadImage from '@/components/upload-image'
import { validateLocationStudyCertificateMetadata } from '@/modules/solicitud-ubicacion/domain/study-certificate-policy'
import { LocationText } from '@/modules/solicitud-ubicacion/domain/solicitud-ubicacion'
import {
  LocationDocumentsFormValues,
  locationDocumentsFormSchema,
} from '@/modules/solicitud-ubicacion/schemas/location-documents.schema'

type Props = {
  activeStep: number
  steps: string[]
  documentNumber: string
  defaultUrl: string | null
  texts: LocationText[]
  setActiveStep: React.Dispatch<React.SetStateAction<number>>
  handleNext: (values: LocationDocumentsFormValues) => void
}

export default function StudyCertificate({
  activeStep,
  steps,
  documentNumber,
  defaultUrl,
  texts,
  setActiveStep,
  handleNext,
}: Props) {
  const form = useForm<LocationDocumentsFormValues>({
    resolver: zodResolver(locationDocumentsFormSchema),
    defaultValues: { studyCertificateUrl: defaultUrl ?? '' },
  })
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleNext)} className="space-y-4 p-2">
        <MyAlert
          title="Certificado de estudios CIUNAC"
          description={texts.find((item) => item.code === 'TEXTO_UBICACION_2')?.content
            ?? 'Adjunte su certificado de estudios CIUNAC en formato PDF.'}
          type="warning"
        />
        <UploadImage
          form={form}
          field="studyCertificateUrl"
          dni={documentNumber}
          folder="becas"
          label="Certificado de estudios CIUNAC"
          accept=".pdf"
          validateFile={validateLocationStudyCertificateMetadata}
        />
        <StepperControl activeStep={activeStep} steps={steps} setActiveStep={setActiveStep} type="submit" />
      </form>
    </Form>
  )
}

