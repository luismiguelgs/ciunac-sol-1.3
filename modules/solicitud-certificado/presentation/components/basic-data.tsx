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
import { MySelect } from '@/components/forms/myselect.field'
import SwithField from '@/components/forms/switch.field'
import MyAlert from '@/components/forms/myAlert'
import { NIVEL } from '@/lib/constants'
import { CertificateBasicData, CertificateCatalogs } from '@/modules/solicitud-certificado/domain/solicitud-certificado'
import { certificateStudentRepository } from '@/modules/solicitud-certificado/infrastructure/certificate-student.repository'
import {
  CertificateBasicDataFormValues,
  certificateBasicDataFormSchema,
} from '@/modules/solicitud-certificado/schemas/basic-data.schema'
import { toCertificateBasicFormValues } from '@/modules/solicitud-certificado/presentation/certificate-form.mapper'

type Props = {
  activeStep: number
  steps: string[]
  catalogs: CertificateCatalogs
  defaultData: CertificateBasicData | null
  setActiveStep: React.Dispatch<React.SetStateAction<number>>
  handleNext: (values: CertificateBasicDataFormValues) => void
}

export default function BasicData({ activeStep, steps, catalogs, defaultData, setActiveStep, handleNext }: Props) {
  const defaults = toCertificateBasicFormValues(defaultData)
  const form = useForm<CertificateBasicDataFormValues>({
    resolver: zodResolver(certificateBasicDataFormSchema),
    defaultValues: defaults,
  })
  const [searching, setSearching] = React.useState(false)
  const selectedFaculty = useWatch({ control: form.control, name: 'facultad' })
  const documentNumber = useWatch({ control: form.control, name: 'dni' })
  const isUnacStudent = useWatch({ control: form.control, name: 'estudiante' })
  const previousFaculty = React.useRef(defaults.facultad)
  const identifiedDocument = React.useRef(defaultData?.existingStudentId ? defaultData.documentNumber : '')
  const filteredSchools = catalogs.schools.filter((school) => school.facultyId === Number(selectedFaculty))
  const faculties = catalogs.faculties.filter((faculty) => faculty.code !== 'PAR')
  const alertText = catalogs.texts.find((item) => item.code === 'TEXTO_1_BASICO')?.content
    ?? 'Complete cuidadosamente los datos solicitados antes de continuar.'

  React.useEffect(() => {
    if (previousFaculty.current && previousFaculty.current !== selectedFaculty) {
      form.setValue('escuela', '')
    }
    previousFaculty.current = selectedFaculty
  }, [form, selectedFaculty])

  React.useEffect(() => {
    if (form.getValues('estudianteId') && documentNumber !== identifiedDocument.current) {
      form.setValue('estudianteId', '')
      identifiedDocument.current = ''
    }
  }, [documentNumber, form])

  const searchStudent = async () => {
    const document = form.getValues('dni').trim().toLocaleUpperCase()
    const validDocument = await form.trigger(['tipo_documento', 'dni'])
    if (!validDocument) {
      toast.warning('Ingrese un documento valido antes de buscar.')
      return
    }

    setSearching(true)
    try {
      const student = await certificateStudentRepository.findByDocument(document)
      if (!student) {
        form.setValue('estudianteId', '')
        identifiedDocument.current = ''
        toast.warning('No se encontraron datos para el documento ingresado.')
        return
      }
      form.setValue('apellidos', student.lastNames)
      form.setValue('nombres', student.names)
      form.setValue('celular', student.phone)
      form.setValue('estudianteId', student.id)
      identifiedDocument.current = document
    } catch {
      toast.error('No se pudieron consultar los datos del estudiante.')
    } finally {
      setSearching(false)
    }
  }

  const phoneRef = useMask({ mask: '_________', replacement: { _: /\d/ } })
  const codeRef = useMask({ mask: '__________', replacement: { _: /\d/ } })
  const documentRef = useMask({ mask: '_________', replacement: { _: /[\da-zA-Z]/ } })
  const lastNamesRef = useMask({ mask: '______________________________', replacement: { _: /[a-zA-Z\u0027 \u00C0-\u00FF]/ } })
  const namesRef = useMask({ mask: '_______________________________', replacement: { _: /[a-zA-Z\u0027 \u00C0-\u00FF]/ } })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleNext)} className="space-y-6" autoComplete="off">
        <MyAlert title="Atencion" description={alertText} type="warning" />
        <Card className="shadow-md transition-shadow duration-300 hover:shadow-lg">
          <CardHeader><CardTitle className="text-lg font-bold text-primary">Informacion de la Solicitud</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <MySelect
              name="tipo_solicitud"
              control={form.control}
              label="Solicitud"
              description="Seleccione su tipo de certificado."
              placeholder="Selecciona una solicitud"
              options={catalogs.requestTypes}
              getOptionValue={(item) => String(item.id)}
              getOptionLabel={(item) => item.name}
            />
            <MySelect
              name="idioma"
              control={form.control}
              label="Programa"
              description="Seleccione el idioma."
              placeholder="Selecciona un programa"
              options={catalogs.languages}
              getOptionValue={(item) => String(item.id)}
              getOptionLabel={(item) => item.name}
            />
            <MySelect name="nivel" control={form.control} label="Nivel" placeholder="Selecciona un nivel" options={NIVEL} />
          </CardContent>
        </Card>
        <Card className="shadow-md transition-shadow duration-300 hover:shadow-lg">
          <CardHeader><CardTitle className="text-lg font-bold text-primary">Informacion Personal</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
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
              <InputField label="Numero de Documento" name="dni" inputRef={documentRef} control={form.control} />
              <Button type="button" onClick={searchStudent} disabled={searching} className="md:mt-9">
                {searching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                {searching ? 'Buscando...' : 'Buscar Documento de Identidad'}
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              <input type="hidden" {...form.register('estudianteId')} />
              <InputField label="Apellidos" name="apellidos" inputRef={lastNamesRef} control={form.control} />
              <InputField label="Nombres" name="nombres" inputRef={namesRef} control={form.control} />
              <InputField label="Celular" name="celular" type="tel" inputRef={phoneRef} control={form.control} />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-md transition-shadow duration-300 hover:shadow-lg">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold text-primary">Informacion Academica</CardTitle>
            <SwithField label="Marcar si es usted Alumno UNAC" name="estudiante" control={form.control} />
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <MySelect
              name="facultad"
              control={form.control}
              label="Facultad"
              placeholder="Selecciona una facultad"
              options={faculties}
              disabled={!isUnacStudent}
              getOptionValue={(item) => String(item.id)}
              getOptionLabel={(item) => item.name}
            />
            <MySelect
              name="escuela"
              control={form.control}
              label="Escuela"
              placeholder={selectedFaculty ? 'Selecciona una escuela' : 'Selecciona una facultad primero'}
              options={filteredSchools}
              disabled={!isUnacStudent || !selectedFaculty}
              getOptionValue={(item) => String(item.id)}
              getOptionLabel={(item) => item.name}
            />
            <InputField label="Codigo" name="codigo" disabled={!isUnacStudent} inputRef={codeRef} control={form.control} />
          </CardContent>
        </Card>
        <StepperControl activeStep={activeStep} steps={steps} setActiveStep={setActiveStep} type="submit" />
      </form>
    </Form>
  )
}
