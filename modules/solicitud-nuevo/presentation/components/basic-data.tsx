'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMask } from '@react-input/mask'
import { Form } from '@/components/ui/form'
import { StepperControl } from '@/components/stepper'
import InputField from '@/components/forms/input.field'
import { RadioGroupField } from '@/components/forms/radio-group.field'
import { DatePicker } from '@/components/forms/date-picker.new'
import { NewStudentBasicData, NewStudentProgramOption } from '@/modules/solicitud-nuevo/domain/new-student'
import { basicInfoSchema, IBasicInfoSchema } from '@/modules/solicitud-nuevo/schemas/basic-info.schema'
import { toBasicInfoFormValues } from '@/modules/solicitud-nuevo/presentation/new-student-form.mapper'
import ProgramSelect from '@/modules/solicitud-nuevo/presentation/components/program-select'

type Props = {
  programs: NewStudentProgramOption[]
  defaultData: NewStudentBasicData | null
  activeStep: number
  steps: string[]
  setActiveStep: React.Dispatch<React.SetStateAction<number>>
  handleNext: (values: IBasicInfoSchema) => void
}

export default function BasicData({ programs, defaultData, activeStep, steps, setActiveStep, handleNext }: Props) {
  const form = useForm<IBasicInfoSchema>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: toBasicInfoFormValues(defaultData),
  })
  const phoneRef = useMask({ mask: '_________', replacement: { _: /\d/ } })
  const documentRef = useMask({ mask: '_________', replacement: { _: /[A-Za-z0-9]/ } })
  const lastNamesRef = useMask({ mask: '______________________________', replacement: { _: /[a-zA-Z\u0027 \u00C0-\u00FF]/ } })
  const namesRef = useMask({ mask: '_______________________________', replacement: { _: /[a-zA-Z\u0027 \u00C0-\u00FF]/ } })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleNext)} className="p-4" autoComplete="off">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          <InputField label="Primer Apellido" name="firstLastname" inputRef={lastNamesRef} placeholder="Ingresar primer apellido..." control={form.control} />
          <InputField label="Segundo Apellido" name="secondLastname" inputRef={lastNamesRef} placeholder="Ingresar segundo apellido..." control={form.control} />
          <InputField label="Primer Nombre" name="firstName" inputRef={namesRef} placeholder="Ingresar primer nombre..." control={form.control} />
          <InputField label="Segundo Nombre" name="secondName" inputRef={namesRef} placeholder="Ingresar segundo nombre..." control={form.control} />
          <DatePicker control={form.control} name="birth_date" label="Fecha de Nacimiento" description="Seleccione su fecha de nacimiento" />
          <InputField name="phone" inputRef={phoneRef} type="tel" control={form.control} description="" />
          <ProgramSelect control={form.control} programs={programs} />
          <RadioGroupField
            label="Tipo de Documento"
            name="document_type"
            options={[
              { value: 'DNI', label: 'Documento de Identidad' },
              { value: 'CE', label: 'Carnet de Extranjería' },
            ]}
            control={form.control}
          />
          <InputField
            label="Número de Documento"
            name="document"
            inputRef={documentRef}
            placeholder="Ingresar número de documento..."
            control={form.control}
            className="uppercase"
          />
          <RadioGroupField
            label="Género"
            name="gender"
            options={[
              { value: 'F', label: 'Femenino' },
              { value: 'M', label: 'Masculino' },
            ]}
            control={form.control}
          />
        </div>
        <StepperControl activeStep={activeStep} steps={steps} setActiveStep={setActiveStep} type="submit" />
      </form>
    </Form>
  )
}
