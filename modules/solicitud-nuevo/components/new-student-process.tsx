'use client'

import React from 'react'
import { toast } from 'sonner'
import { Stepper } from '@/components/stepper'
import { normalizeAppError } from '@/modules/shared/application/errors/app-error'
import { IVerificationSchema } from '@/modules/shared/schemas/verification.schema'
import { NewStudentProgramOption } from '../model'
import { IBasicInfoSchema } from './basic-info.schema'
import { toNewStudentBasicData } from './new-student-form.mapper'
import useNewStudentStore from '../store'
import Verification from './verification'
import BasicData from './basic-data'
import Register from './register'

const STEPS = ['Verificación', 'Datos Básicos', 'Registro']

type Props = {
  programs: NewStudentProgramOption[]
}

export default function NewStudentProcess({ programs }: Props) {
  const workflow = useNewStudentStore((state) => state.workflow)
  const initialize = useNewStudentStore((state) => state.initialize)
  const completeBasicData = useNewStudentStore((state) => state.completeBasicData)
  const reset = useNewStudentStore((state) => state.reset)
  const [activeStep, setActiveStep] = React.useState(0)

  React.useEffect(() => {
    reset()
    setActiveStep(0)
  }, [reset])

  const handleVerification = (values: IVerificationSchema) => {
    initialize(values.email)
    setActiveStep(1)
  }

  const handleBasicData = (values: IBasicInfoSchema) => {
    try {
      completeBasicData(toNewStudentBasicData(values, programs))
      setActiveStep(2)
    } catch (error) {
      toast.error(normalizeAppError(error, 'Los datos del alumno no son válidos.').message)
    }
  }

  return (
    <div className="flex items-center justify-center">
      <Stepper steps={STEPS} activeStep={activeStep}>
        <Verification
          activeStep={activeStep}
          steps={STEPS}
          setActiveStep={setActiveStep}
          handleNext={handleVerification}
        />
        <BasicData
          programs={programs}
          defaultData={workflow.draft.basicData}
          activeStep={activeStep}
          steps={STEPS}
          setActiveStep={setActiveStep}
          handleNext={handleBasicData}
        />
        <Register activeStep={activeStep} steps={STEPS} setActiveStep={setActiveStep} />
      </Stepper>
    </div>
  )
}
