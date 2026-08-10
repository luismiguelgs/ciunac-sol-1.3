'use client'

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
import MyAlert from '@/components/forms/myAlert'
import UploadImage from '@/components/upload-image'
import { validateIdentityDocumentMetadata } from '@/modules/solicitud-ubicacion/domain/identity-document-policy'
import { LocationBasicData, LocationCatalogs } from '@/modules/solicitud-ubicacion/domain/solicitud-ubicacion'
import { locationStudentRepository } from '@/modules/solicitud-ubicacion/infrastructure/location-student.repository'
import {
  LocationBasicDataFormValues,
  locationBasicDataFormSchema,
} from '@/modules/solicitud-ubicacion/schemas/location-basic-data.schema'
import { toLocationBasicFormValues } from '@/modules/solicitud-ubicacion/presentation/location-form.mapper'

const LEVELS = [
  { value: '1', label: 'BASICO' },
  { value: '2', label: 'INTERMEDIO' },
  { value: '3', label: 'AVANZADO' },
]

type Props = {
  activeStep: number
  steps: string[]
  catalogs: LocationCatalogs
  defaultData: LocationBasicData | null
  isCiunacStudent: boolean
  setActiveStep: React.Dispatch<React.SetStateAction<number>>
  handleNext: (values: LocationBasicDataFormValues) => Promise<void>
}

export default function BasicData({
  activeStep,
  steps,
  catalogs,
  defaultData,
  isCiunacStudent,
  setActiveStep,
  handleNext,
}: Props) {
  const defaults = toLocationBasicFormValues(defaultData)
  const form = useForm<LocationBasicDataFormValues>({
    resolver: zodResolver(locationBasicDataFormSchema),
    defaultValues: defaults,
  })
  const [searching, setSearching] = React.useState(false)
  const documentNumber = useWatch({ control: form.control, name: 'dni' })
  const previousDocument = React.useRef(defaults.dni)

  React.useEffect(() => {
    if (previousDocument.current && previousDocument.current !== documentNumber) {
      form.setValue('estudianteId', '')
      form.setValue('img_dni', '')
    }
    previousDocument.current = documentNumber
  }, [documentNumber, form])

  const searchStudent = async () => {
    const document = form.getValues('dni').trim().toLocaleUpperCase()
    if (!await form.trigger(['tipo_documento', 'dni'])) {
      toast.warning('Ingrese un documento valido antes de buscar.')
      return
    }
    setSearching(true)
    try {
      const student = await locationStudentRepository.findByDocument(document)
      if (!student) {
        form.setValue('estudianteId', '')
        toast.warning('No se encontraron datos para el documento ingresado.')
        return
      }
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

  const phoneRef = useMask({ mask: '_________', replacement: { _: /\d/ } })
  const documentRef = useMask({ mask: '_________', replacement: { _: /[\da-zA-Z]/ } })
  const lastNamesRef = useMask({ mask: '______________________________', replacement: { _: /[a-zA-Z\u0027 \u00C0-\u00FF]/ } })
  const namesRef = useMask({ mask: '_______________________________', replacement: { _: /[a-zA-Z\u0027 \u00C0-\u00FF]/ } })
  const alertText = catalogs.texts.find((item) => item.code === 'TEXTO_UBICACION_1')?.content
    ?? 'Complete cuidadosamente los datos solicitados.'

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleNext)} className="w-full space-y-6" autoComplete="off">
        <MyAlert title="Atencion" description={alertText} type="warning" />
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-5">
          <Card className="shadow-md md:col-span-3">
            <CardHeader><CardTitle className="text-lg font-bold text-primary">Informacion personal</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <RadioGroupField
                  label="Tipo de documento"
                  name="tipo_documento"
                  options={[
                    { value: 'DNI', label: 'Documento de Identidad' },
                    { value: 'CE', label: 'Carnet de Extranjeria' },
                    { value: 'PASAPORTE', label: 'Pasaporte' },
                  ]}
                  control={form.control}
                />
                <div>
                  <InputField label="Numero de documento" name="dni" inputRef={documentRef} control={form.control} />
                  <Button type="button" onClick={searchStudent} disabled={searching} className="mt-2 w-full">
                    {searching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                    {searching ? 'Buscando...' : 'Buscar documento'}
                  </Button>
                </div>
              </div>
              <input type="hidden" {...form.register('estudianteId')} />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InputField label="Apellidos" name="apellidos" inputRef={lastNamesRef} control={form.control} />
                <InputField label="Nombres" name="nombres" inputRef={namesRef} control={form.control} />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <MySelect
                  name="idioma"
                  control={form.control}
                  label="Programa"
                  placeholder="Seleccione un programa"
                  options={catalogs.languages}
                  getOptionValue={(item) => String(item.id)}
                  getOptionLabel={(item) => item.name}
                />
                <MySelect
                  name="nivel"
                  control={form.control}
                  label="Nivel"
                  placeholder="Seleccione un nivel"
                  options={LEVELS}
                  disabled={!isCiunacStudent}
                />
              </div>
              <InputField label="Celular" name="celular" type="tel" inputRef={phoneRef} control={form.control} />
            </CardContent>
          </Card>
          <div className="md:col-span-2">
            <UploadImage
              form={form}
              field="img_dni"
              label="Documento de identidad"
              dni={documentNumber}
              folder="dnis"
              validateFile={validateIdentityDocumentMetadata}
            />
          </div>
        </div>
        <StepperControl activeStep={activeStep} steps={steps} setActiveStep={setActiveStep} type="submit" />
      </form>
    </Form>
  )
}

