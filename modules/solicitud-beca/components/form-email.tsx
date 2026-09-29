'use client'

import { useRouter } from 'next/navigation'
import EmailVerificationForm from '@/modules/shared/components/email-verification-form'

export default function ScholarshipEmailForm() {
  const router = useRouter()
  return (
    <EmailVerificationForm
      purpose="BECA"
      action={() => router.push('/solicitud-beca/proceso')}
    />
  )
}
