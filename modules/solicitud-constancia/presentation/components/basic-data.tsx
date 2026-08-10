import React from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMask } from '@react-input/mask'
import { Loader2, Search } from 'lucide-react'
import { toast } from 'sonner'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StepperControl } from '@/components/stepper'
import InputField from '@/components/forms/input.field'
import { RadioGroupField } from '@/components/forms/radio-group.field'
import SelectFacultad from '@/components/forms/select-facultad.field'
import { MySelect } from '@/components/forms/myselect.field'
import SelectSolicitud from '@/components/forms/select-solicitud'
import { SelectLanguage } from '@/components/forms/select-lang.field'
import SwithField from '@/components/forms/switch.field'
import MyAlert from '@/components/forms/myAlert'
import useEscuelas from '@/hooks/useEscuelas'
import useTexts from '@/hooks/useTexts'
import { NIVEL } from '@/lib/constants'
import { IEscuela } from '@/modules/shared/interfaces/types.interface'
import {
  constanciaBasicDataInitialValues,
  ConstanciaBasicDataValues,
  constanciaBasicDataSchema,
} from '@/modules/solicitud-constancia/schemas/basic-data.schema'
import { ConstanciaBasicData } from '@/modules/solicitud-constancia/domain/solicitud-constancia'
import { constanciaStudentRepository } from '@/modules/solicitud-constancia/infrastructure/constancia-student.repository'

type Props = {
  activeStep: number
  steps: string[]
  setActiveStep: React.Dispatch<React.SetStateAction<number>>
  handleNext: (values: ConstanciaBasicDataValues) => void
  defaultData: ConstanciaBasicData | null
}

export default function BasicData({ activeStep, steps, setActiveStep, handleNext, defaultData }: Props) {
  const escuelas = useEscuelas()
  const textos = useTexts()
  const [searching, setSearching] = React.useState(false)
  const phoneRef = useMask({ mask: '_________', replacement: { _: /\d/ } })
  const codeRef = useMask({ mask: '__________', replacement: { _: /\d/ } })
  const documentRef = useMask({ mask: '_________', replacement: { _: /[\da-zA-Z]/ } })

  const form = useForm<ConstanciaBasicDataValues>({
    resolver: zodResolver(constanciaBasicDataSchema),
    defaultValues: {
      ...constanciaBasicDataInitialValues,
      tipo_solicitud: defaultData?.typeId === 6 ? '6' : '5',
      idioma: defaultData ? String(defaultData.languageId) : '',
      nivel: defaultData ? String(defaultData.levelId) : '',
      apellidos: defaultData?.lastNames ?? '',
      nombres: defaultData?.names ?? '',
      tipo_documento: defaultData?.documentType ?? 'DNI',
      celular: defaultData?.phone ?? '',
      dni: defaultData?.documentNumber ?? '',
      estudianteId: defaultData?.existingStudentId ?? '',
      estudiante: defaultData?.isUnacStudent ?? false,
      facultad: defaultData?.isUnacStudent ? String(defaultData.facultyId) : '',
      escuela: defaultData?.isUnacStudent ? String(defaultData.schoolId) : '',
      codigo: defaultData?.isUnacStudent ? defaultData.studentCode : '',
    },
  })

  const selectedFaculty = useWatch({ control: form.control, name: 'facultad' })
  const isUnacStudent = useWatch({ control: form.control, name: 'estudiante' })
  const filteredSchools = escuelas?.filter((school: IEscuela) => school.facultadId === Number(selectedFaculty)) ?? []
  const alertText = textos?.find((item) => item.codigo === 'TEXTO_1_BASICO')?.contenido
    ?? 'Complete cuidadosamente los datos solicitados antes de continuar.'

  const searchStudent = async () => {
    const documentNumber = form.getValues('dni').trim()
    if (!documentNumber) {
      toast.warning('Ingrese el numero de documento para buscar.')
      return
    }

    setSearching(true)
    try {
      const student = await constanciaStudentRepository.findByDocument(documentNumber)
      form.setValue('apellidos', student.lastNames)
      form.setValue('nombres', student.names)
      form.setValue('celular', student.phone)
      form.setValue('estudianteId', student.id)
    } catch {
      toast.error('No se pudieron consultar los datos del estudiante.')
    } finally {
      setSearching(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleNext)} className="space-y-6" autoComplete="off">
        <MyAlert title="Atencion" description={alertText} type="warning" />
        <Card className="shadow-md">
          <CardHeader><CardTitle className="text-lg text-primary">Informacion de la Constancia</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SelectSolicitud name="tipo_solicitud" control={form.control} tipoSolicitud="constancia" />
            <SelectLanguage name="idioma" control={form.control} />
            <MySelect
              name="nivel"
              control={form.control}
              label="Nivel"
              placeholder="Selecciona un nivel"
              options={NIVEL}
            />
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader><CardTitle className="text-lg text-primary">Informacion Personal</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <RadioGroupField
                label="Tipo de Documento"
                name="tipo_documento"
                options={[
                  { value: 'DNI', label: 'Documento de Identidad (DNI)' },
                  { value: 'CE', label: 'Carnet de Extranjeria' },
                  { value: 'PASAPORTE', label: 'Pasaporte' },
                ]}
                control={form.control}
              />
              <InputField
                label="Numero de Documento"
                name="dni"
                inputRef={documentRef}
                control={form.control}
              />
              <Button type="button" onClick={searchStudent} disabled={searching} className="sm:mt-9">
                {searching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                {searching ? 'Buscando...' : 'Buscar Documento de Identidad'}
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <input type="hidden" {...form.register('estudianteId')} />
              <InputField label="Apellidos" name="apellidos" control={form.control} />
              <InputField label="Nombres" name="nombres" control={form.control} />
              <InputField label="Celular" name="celular" type="tel" inputRef={phoneRef} control={form.control} />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-lg text-primary">Informacion Academica</CardTitle>
            <SwithField
              label="Marcar si es usted Alumno UNAC"
              name="estudiante"
              control={form.control}
            />
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SelectFacultad name="facultad" disabled={!isUnacStudent} control={form.control} />
            <MySelect
              name="escuela"
              control={form.control}
              label="Escuela"
              placeholder={selectedFaculty ? 'Selecciona una escuela' : 'Selecciona una facultad primero'}
              options={filteredSchools}
              disabled={!isUnacStudent || !selectedFaculty}
              getOptionValue={(item: IEscuela) => String(item.id)}
              getOptionLabel={(item: IEscuela) => item.nombre}
            />
            <InputField
              label="Codigo"
              name="codigo"
              disabled={!isUnacStudent}
              inputRef={codeRef}
              control={form.control}
            />
          </CardContent>
        </Card>
        <StepperControl
          activeStep={activeStep}
          steps={steps}
          setActiveStep={setActiveStep}
          type="submit"
        />
      </form>
    </Form>
  )
}
