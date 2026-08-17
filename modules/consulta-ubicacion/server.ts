import 'server-only'

import {
  GetLocationConsultationUseCase,
  type LocationConsultationResult,
} from '@/modules/consulta-ubicacion/application/get-location-consultation.use-case'
import {
  serverLocationContextRepository,
  serverLocationCycleRepository,
  serverLocationExamRepository,
  serverLocationPlacementRepository,
} from '@/modules/consulta-ubicacion/infrastructure/server/location-consultation.repository'

const getLocationConsultationUseCase = new GetLocationConsultationUseCase({
  context: serverLocationContextRepository,
  placements: serverLocationPlacementRepository,
  exams: serverLocationExamRepository,
  cycles: serverLocationCycleRepository,
})

type LocationConsultationQuery = {
  documentNumber: string
}

export function getLocationConsultation(
  query: LocationConsultationQuery,
): Promise<LocationConsultationResult | null> {
  return getLocationConsultationUseCase.execute(query.documentNumber)
}
