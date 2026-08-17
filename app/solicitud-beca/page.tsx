import { ScholarshipEmailForm } from '@/modules/solicitud-beca'
import EmailVerificationView from '@/modules/shared/components/verificacion-email-view'

export default function ScholarshipPage() {
  return (
    <div className="p-4">
      <h2 className="mb-6 text-center text-2xl font-bold uppercase">
        Verificación de correo electrónico
      </h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <EmailVerificationView />
        <ScholarshipEmailForm />
      </div>
    </div>
  )
}
