'use client'

import React from 'react'
import { toast } from 'sonner'
import { Stepper } from '@/components/stepper'
import { normalizeAppError } from '@/modules/shared/application/errors/app-error'
import { ScholarshipCatalogs } from '@/modules/solicitud-beca/domain/solicitud-beca'
import { IBasicInfoSchema } from '@/modules/solicitud-beca/schemas/basic-data.schema'
import { DocumentsFormValues } from '@/modules/solicitud-beca/schemas/documents.schema'
import {
  toScholarshipBasicData,
  toScholarshipDocuments,
} from '@/modules/solicitud-beca/presentation/scholarship-form.mapper'
import useSolicitudBecaStore from '@/modules/solicitud-beca/presentation/solicitud-beca.store'
import BasicData from '@/modules/solicitud-beca/presentation/components/basic-data'
import Documents from '@/modules/solicitud-beca/presentation/components/documents'
import Register from '@/modules/solicitud-beca/presentation/components/register'

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
