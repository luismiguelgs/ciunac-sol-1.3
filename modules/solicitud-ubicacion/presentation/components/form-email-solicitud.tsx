'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import FormEmail from '@/modules/shared/components/email-verification-form'
import { normalizeAppError } from '@/modules/shared/application/errors/app-error'
import { LocationText } from '@/modules/solicitud-ubicacion/domain/solicitud-ubicacion'
import { saveLocationProfile } from '@/modules/solicitud-ubicacion/client'
import ProfileDialog from '@/modules/solicitud-ubicacion/presentation/components/profile-dialog'

export default function FormEmailSolicitud({ texts }: { texts: LocationText[] }) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const saveProfile = async (isCiunacStudent: boolean) => {
    setSubmitting(true)
    setError(null)
    try {
      await saveLocationProfile(isCiunacStudent)
      router.push('/solicitud-ubicacion/proceso')
    } catch (cause) {
      setError(normalizeAppError(cause, 'No se pudo guardar el perfil de ubicacion.').message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <FormEmail action={() => setOpen(true)} purpose="UBICACION" />
      <ProfileDialog
        open={open}
        texts={texts}
        submitting={submitting}
        error={error}
        action={saveProfile}
      />
    </>
  )
}
