'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMask } from '@react-input/mask'
import { Loader2 } from 'lucide-react'
import ReCAPTCHA from 'react-google-recaptcha'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import InputField from '@/components/forms/input.field'
import { Form } from '@/components/ui/form'
import { MyAlertDialog } from '@/components/dialogs/alert-dialog'
import { consultByDocument } from '@/modules/security/client/security-client'
import { ConsultationType } from '@/modules/consultas/domain/consulted-request'

const consultationFormSchema = z.object({
  documento: z.string()
    .trim()
    .min(8, 'El numero de documento es requerido')
    .max(9, 'Ingrese un numero de documento valido')
    .regex(/^[A-Za-z0-9]+$/, 'Ingrese un numero de documento valido')
    .transform((value) => value.toUpperCase()),
})

type ConsultationFormValues = z.infer<typeof consultationFormSchema>
type ConsultationFormState =
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'not_found'; title: string; description: string }
  | { status: 'error'; title: string; description: string }

type Props = {
  solicitud: ConsultationType
}

export default function ConsultaForm({ solicitud }: Props) {
  const router = useRouter()
  const [state, setState] = React.useState<ConsultationFormState>({ status: 'idle' })
  const captchaRef = React.useRef<ReCAPTCHA>(null)
  const documentRef = useMask({ mask: '_________', replacement: { _: /[A-Za-z0-9]/ } })
  const form = useForm<ConsultationFormValues>({
    resolver: zodResolver(consultationFormSchema),
    defaultValues: { documento: '' },
  })

  const onSubmit = async (data: ConsultationFormValues) => {
    const captchaToken = captchaRef.current?.getValue()
    if (!captchaToken) {
      setState({
        status: 'error',
        title: 'Confirme que no es un robot',
        description: 'Complete el CAPTCHA para continuar.',
      })
      return
    }

    setState({ status: 'checking' })
    try {
      const result = await consultByDocument(data.documento, solicitud, captchaToken)
      if (!result.found) {
        setState({
          status: 'not_found',
          title: 'Busqueda no encontrada',
          description: 'No se encontro una solicitud para el numero de documento ingresado.',
        })
        return
      }

      const destination = solicitud === 'CERTIFICADO' ? 'consulta-solicitud' : 'consulta-ubicacion'
      router.push(`/${destination}/${data.documento}`)
    } catch (error) {
      setState({
        status: 'error',
        title: 'No se pudo realizar la consulta',
        description: error instanceof Error ? error.message : 'Intente nuevamente mas tarde.',
      })
    } finally {
      captchaRef.current?.reset()
    }
  }

  const loading = state.status === 'checking'
  const dialog = state.status === 'not_found' || state.status === 'error' ? state : null

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-3xl font-bold">
              Consulta de Solicitud de {solicitud === 'EXAMEN' ? 'EXAMEN DE UBICACION' : 'CERTIFICADO'}
            </h1>
            <p className="text-balance text-sm text-muted-foreground">
              Ingrese su documento de identidad para consultar el estado de su solicitud.
            </p>
          </div>
          <div className="mt-4 grid gap-6">
            <div className="grid gap-5">
              <InputField
                name="documento"
                label="Documento de Identidad"
                description="Ingrese su Documento de Identidad (DNI/CE/PASAPORTE)"
                placeholder="4025..."
                control={form.control}
                disabled={loading}
                inputRef={documentRef}
              />
              <div className="flex w-full justify-center">
                <ReCAPTCHA
                  sitekey={String(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY)}
                  ref={captchaRef}
                  size="normal"
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading ? 'Consultando...' : 'Buscar'}
            </Button>
          </div>
        </form>
      </Form>
      <MyAlertDialog
        open={Boolean(dialog)}
        onOpenChange={(open) => { if (!open) setState({ status: 'idle' }) }}
        title={dialog?.title ?? ''}
        description={dialog?.description ?? ''}
      />
    </>
  )
}
