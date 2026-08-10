import {
  ConsultationRequestPort,
  ConsultationTextPort,
} from '@/modules/consultas/application/get-consultation-requests.use-case'
import {
  matchesConsultationType,
  normalizeConsultationDocument,
} from '@/modules/consultas/domain/consulted-request'
import { findConsultationText } from '@/modules/consultas/domain/consultation-text'
import {
  joinLocationExamResults,
  LocationConsultation,
  LocationCycle,
  LocationExam,
  LocationPlacementRecord,
  selectLatestLocationRequest,
} from '@/modules/consulta-ubicacion/domain/location-consultation'

export interface LocationPlacementPort {
  findByDocument(documentNumber: string): Promise<LocationPlacementRecord[]>
}

export interface LocationExamPort {
  list(): Promise<LocationExam[]>
}

export interface LocationCyclePort {
  list(): Promise<LocationCycle[]>
}

type Dependencies = {
  requests: ConsultationRequestPort
  placements: LocationPlacementPort
  exams: LocationExamPort
  cycles: LocationCyclePort
  texts: ConsultationTextPort
}

export class GetLocationConsultationUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(documentNumber: string): Promise<LocationConsultation | null> {
    const normalizedDocument = normalizeConsultationDocument(documentNumber)
    const [requests, placements, exams, cycles, textResult] = await Promise.all([
      this.dependencies.requests.findByDocument(normalizedDocument),
      this.dependencies.placements.findByDocument(normalizedDocument),
      this.dependencies.exams.list(),
      this.dependencies.cycles.list(),
      this.dependencies.texts.list()
        .then((texts) => ({ ok: true as const, texts }))
        .catch(() => ({ ok: false as const, texts: [] })),
    ])

    const locationRequests = requests.filter((request) => (
      matchesConsultationType(request, 'EXAMEN')
      && request.student.documentNumber.trim().toUpperCase() === normalizedDocument
    ))
    const activeRequest = selectLatestLocationRequest(locationRequests)
    if (!activeRequest) return null

    const results = joinLocationExamResults(
      placements,
      exams,
      cycles,
      locationRequests,
      normalizedDocument,
    )

    return {
      documentNumber: normalizedDocument,
      student: {
        names: activeRequest.student.names,
        lastNames: activeRequest.student.lastNames,
        documentNumber: activeRequest.student.documentNumber,
      },
      activeRequestId: activeRequest.id,
      results,
      yearName: findConsultationText(textResult.texts, 'TEXTO_NOMBREAN'),
      cargoTexts: textResult.texts,
      textStatus: textResult.ok ? 'available' : 'unavailable',
    }
  }
}
