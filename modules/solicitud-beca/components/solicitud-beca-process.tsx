'use client'

import React from 'react'
import { toast } from 'sonner'
import { Stepper } from '@/components/stepper'
import { normalizeAppError } from '@/modules/shared/application/errors/app-error'
import { ScholarshipCatalogs } from '../model'
import { IBasicInfoSchema } from './basic-data.schema'
import { DocumentsFormValues } from './documents.schema'
import {
  toScholarshipBasicData,
  toScholarshipDocuments,
} from './scholarship-form.mapper'
import useSolicitudBecaStore from '../store'
import BasicData from './basic-data'
import Documents from './documents'
import Register from './register'

const STEPS = ['Solicitud de Beca', 'Documentos Adjuntos', 'Registro']

type Props = {
  email: string
  catalogs: ScholarshipCatalogs
}

export default function SolicitudBecaProcess({ email, catalogs }: Props) {
  const workflow = useSolicitudBecaStore((state) => state.workflow)
  const initialize = useSolicitudBecaStore((state) => state.initialize)
  const completeBasicData = useSolicitudBecaStore((state) => state.completeBasicData)
  const completeDocuments = useSolicitudBecaStore((state) => state.completeDocuments)
  const [activeStep, setActiveStep] = React.useState(0)

  React.useEffect(() => {
    initialize(email)
    setActiveStep(0)
  }, [email, initialize])

  const handleBasicData = (values: IBasicInfoSchema) => {
    try {
      completeBasicData(toScholarshipBasicData(values, catalogs))
      setActiveStep(1)
    } catch (error) {
      toast.error(normalizeAppError(error, 'Los datos académicos no son válidos.').message)
    }
  }

  const handleDocuments = (values: DocumentsFormValues) => {
    try {
      completeDocuments(toScholarshipDocuments(values))
      setActiveStep(2)
    } catch (error) {
      toast.error(normalizeAppError(error, 'Los documentos adjuntos no son válidos.').message)
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
        <Documents
          activeStep={activeStep}
          steps={STEPS}
          documentNumber={workflow.draft.basicData?.documentNumber ?? ''}
          defaultDocuments={workflow.draft.documents}
          setActiveStep={setActiveStep}
          handleNext={handleDocuments}
        />
        <Register activeStep={activeStep} steps={STEPS} setActiveStep={setActiveStep} />
      </Stepper>
    </div>
  )
}
