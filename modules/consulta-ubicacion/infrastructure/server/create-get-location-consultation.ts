import 'server-only'

import { GetLocationConsultationUseCase } from '@/modules/consulta-ubicacion/application/get-location-consultation.use-case'
import {
  serverLocationCycleRepository,
  serverLocationExamRepository,
  serverLocationPlacementRepository,
} from '@/modules/consulta-ubicacion/infrastructure/server/location-consultation.repository'
import {
  serverConsultationRequestRepository,
  serverConsultationTextRepository,
} from '@/modules/consultas/infrastructure/server/consultation.repository'

export function createGetLocationConsultationUseCase(): GetLocationConsultationUseCase {
  return new GetLocationConsultationUseCase({
    requests: serverConsultationRequestRepository,
    placements: serverLocationPlacementRepository,
    exams: serverLocationExamRepository,
    cycles: serverLocationCycleRepository,
    texts: serverConsultationTextRepository,
  })
}
