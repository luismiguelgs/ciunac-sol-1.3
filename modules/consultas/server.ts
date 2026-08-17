import 'server-only'

import {
  GetConsultationRequestsUseCase,
  type ConsultationRequestsResult,
} from '@/modules/consultas/application/get-consultation-requests.use-case'
import type { ConsultationType } from '@/modules/consultas/domain/consulted-request'
import {
  serverConsultationRequestRepository,
  serverConsultationTextRepository,
} from '@/modules/consultas/infrastructure/server/consultation.repository'

const getConsultationRequestsUseCase = new GetConsultationRequestsUseCase({
  requests: serverConsultationRequestRepository,
  texts: serverConsultationTextRepository,
})

type ConsultationQuery = {
  documentNumber: string
  type: ConsultationType
}

export function getConsultationRequests(
  query: ConsultationQuery,
): Promise<ConsultationRequestsResult> {
  return getConsultationRequestsUseCase.execute(query.documentNumber, query.type)
}
