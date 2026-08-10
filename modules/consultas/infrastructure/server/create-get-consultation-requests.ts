import 'server-only'

import { GetConsultationRequestsUseCase } from '@/modules/consultas/application/get-consultation-requests.use-case'
import {
  serverConsultationRequestRepository,
  serverConsultationTextRepository,
} from '@/modules/consultas/infrastructure/server/consultation.repository'

export function createGetConsultationRequestsUseCase() {
  return new GetConsultationRequestsUseCase({
    requests: serverConsultationRequestRepository,
    texts: serverConsultationTextRepository,
  })
}
