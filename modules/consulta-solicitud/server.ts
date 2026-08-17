import 'server-only'

import { getConsultationRequests } from '@/modules/consultas/server'

export function getSolicitudConsultation({ documentNumber }: { documentNumber: string }) {
  return getConsultationRequests({ documentNumber, type: 'CERTIFICADO' })
}
