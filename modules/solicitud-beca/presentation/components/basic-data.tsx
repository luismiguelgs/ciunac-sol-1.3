'use client'

import React from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMask } from '@react-input/mask'
import { Form } from '@/components/ui/form'
import { StepperControl } from '@/components/stepper'
import InputField from '@/components/forms/input.field'
import { RadioGroupField } from '@/components/forms/radio-group.field'
import { MySelect } from '@/components/forms/myselect.field'
import { ScholarshipBasicData, ScholarshipCatalogs } from '@/modules/solicitud-beca/domain/solicitud-beca'
import { basicInfoSchema, IBasicInfoSchema } from '@/modules/solicitud-beca/presentation/schemas/basic-data.schema'
import { toBasicFormValues } from '@/modules/solicitud-beca/presentation/scholarship-form.mapper'

type Props = {
  activeStep: number
  steps: string[]
  catalogs: ScholarshipCatalogs
  defaultData: ScholarshipBasicData | null
  setActiveStep: React.Dispatch<React.SetStateAction<number>>
  handleNext: (values: IBasicInfoSchema) => void
}

export default function BasicData({ activeStep, steps, catalogs, defaultData, setActiveStep, handleNext }: Props) {
  const defaults = toBasicFormValues(defaultData)
  const form = useForm<IBasicInfoSchema>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: defaults,
  })
  const selectedFaculty = useWatch({ control: form.control, name: 'facultad' })
  const previousFaculty = React.useRef(defaults.facultad)
  const filteredSchools = catalogs.schools.filter((school) => school.facultyId === Number(selectedFaculty))
  const faculties = catalogs.faculties.filter((faculty) => faculty.code !== 'PAR')

  React.useEffect(() => {
    if (previousFaculty.current && previousFaculty.current !== selectedFaculty) {
      form.setValue('escuela', '')
    }
    previousFaculty.current = selectedFaculty
  }, [form, selectedFaculty])

  const phoneRef = useMask({ mask: '_________', replacement: { _: /\d/ } })
  const codeRef = useMask({ mask: '__________', replacement: { _: /\d/ } })
  const dniRef = useMask({ mask: '_________', replacement: { _: /\d/ } })
  const lastNamesRef = useMask({ mask: '______________________________', replacement: { _: /[a-zA-Z\u0027 \u00C0-\u00FF]/ } })
  const namesRef = useMask({ mask: '_______________________________', replacement: { _: /[a-zA-Z\u0027 \u00C0-\u00FF]/ } })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleNext)} className="p-4" autoComplete="off">
        <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2 md:grid-cols-3">
          <InputField label="Apellidos" name="apellidos" inputRef={lastNamesRef} placeholder="Ingresar apellidos..." control={form.control} />
          <InputField label="Nombres" name="nombres" inputRef={namesRef} placeholder="Ingresar nombres..." control={form.control} />
          <MySelect
            name="facultad"
            control={form.control}
            label="Facultad"
            placeholder="Selecciona una facultad"
            options={faculties}
            getOptionValue={(item) => String(item.id)}
            getOptionLabel={(item) => item.name}
          />
          <MySelect
            name="escuela"
            control={form.control}
            label="Escuela"
            placeholder={selectedFaculty ? 'Selecciona una escuela' : 'Selecciona una facultad primero'}
            options={filteredSchools}
            disabled={!selectedFaculty}
            getOptionValue={(item) => String(item.id)}
            getOptionLabel={(item) => item.name}
          />
          <InputField label="Código" name="codigo" inputRef={codeRef} placeholder="Ingresar código..." control={form.control} />
          <InputField label="Dirección" name="direccion" placeholder="Ingresar dirección..." control={form.control} />
          <InputField name="celular" inputRef={phoneRef} type="tel" control={form.control} />
          <RadioGroupField
            label="Tipo de Documento"
            name="tipo_documento"
            options={[
              { value: 'DNI', label: 'Documento de Identidad (DNI)' },
              { value: 'CE', label: 'Carnet de Extranjería' },
              { value: 'PASAPORTE', label: 'Pasaporte' },
            ]}
            control={form.control}
          />
          <InputField
            label="Número de Documento de Identidad"
            name="dni"
            inputRef={dniRef}
            placeholder="Ingresar número de documento..."
            control={form.control}
          />
        </div>
        <StepperControl activeStep={activeStep} steps={steps} setActiveStep={setActiveStep} type="submit" />
      </form>
    </Form>
  )
}
