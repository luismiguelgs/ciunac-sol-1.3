'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Form } from '@/components/ui/form'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import MyAlert from '@/components/forms/myAlert'
import SwithField from '@/components/forms/switch.field'
import { LocationText } from '@/modules/solicitud-ubicacion/domain/solicitud-ubicacion'
import { locationProfileCommandSchema } from '@/modules/solicitud-ubicacion/application/validation/solicitud-ubicacion.schema'

type ProfileValues = { isCiunacStudent: boolean }

type Props = {
  open: boolean
  texts: LocationText[]
  submitting: boolean
  error: string | null
  action: (isCiunacStudent: boolean) => Promise<void>
}

export default function ProfileDialog({ open, texts, submitting, error, action }: Props) {
  const form = useForm<ProfileValues>({
    resolver: zodResolver(locationProfileCommandSchema),
    defaultValues: { isCiunacStudent: false },
  })
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Verificacion de informacion adicional</AlertDialogTitle>
          <AlertDialogDescription>Indique su condicion antes de iniciar la solicitud.</AlertDialogDescription>
        </AlertDialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => action(data.isCiunacStudent))} className="space-y-4">
            <MyAlert
              title="Alumno CIUNAC"
              description={texts.find((item) => item.code === 'TEXTO_UBICACION_1')?.content
                ?? 'Marque esta opcion si actualmente es alumno CIUNAC.'}
              type="info"
            />
            <SwithField
              control={form.control}
              name="isCiunacStudent"
              label="Alumno CIUNAC"
              description="Los alumnos CIUNAC deben adjuntar su certificado de estudios en PDF."
            />
            {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}
            <AlertDialogFooter>
              <AlertDialogAction type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Continuar
              </AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
