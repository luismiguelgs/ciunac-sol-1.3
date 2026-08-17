import type {
  LocationContextPort,
  LocationCyclePort,
  LocationExamPort,
  LocationPlacementPort,
} from '@/modules/consulta-ubicacion/application/ports/location-consultation.port'
import {
  canGenerateLocationCertificate,
  findLocationText,
  joinLocationExamResults,
  normalizeLocationDocument,
  selectLatestLocationRequest,
  toLocationCargo,
  type LocationCargo,
  type LocationExamResult,
  type LocationText,
} from '@/modules/consulta-ubicacion/domain/location-consultation'
import { AppError } from '@/modules/shared/application/errors/app-error'

type Dependencies = {
  context: LocationContextPort
  placements: LocationPlacementPort
  exams: LocationExamPort
  cycles: LocationCyclePort
}

export type LocationConsultationResult = {
  documentNumber: string
  student: {
    names: string
    lastNames: string
    documentNumber: string
  }
  activeRequestId: number
  results: Array<LocationExamResult & { certificateAvailable: boolean }>
  yearName: string | null
  cargo: LocationCargo
  cargoTexts: LocationText[]
  textStatus: 'available' | 'unavailable'
}

export class GetLocationConsultationUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(documentNumber: string): Promise<LocationConsultationResult | null> {
    const normalizedDocument = normalizeLocationDocument(documentNumber)
    if (!normalizedDocument) {
      throw new AppError({
        code: 'VALIDATION',
        status: 400,
        message: 'El número de documento no es válido.',
      })
    }

    const [context, placements, exams, cycles] = await Promise.all([
      this.dependencies.context.load(normalizedDocument),
      this.dependencies.placements.findByDocument(normalizedDocument),
      this.dependencies.exams.list(),
      this.dependencies.cycles.list(),
    ])

    const locationRequests = context.requests.filter(
      (request) => request.student.documentNumber.trim().toUpperCase() === normalizedDocument,
    )
    const activeRequest = selectLatestLocationRequest(locationRequests)
    if (!activeRequest) return null

    const yearName = findLocationText(context.texts, 'TEXTO_NOMBREAN')
    const results = joinLocationExamResults(
      placements,
      exams,
      cycles,
      locationRequests,
      normalizedDocument,
    ).map((result) => ({
      ...result,
      certificateAvailable: canGenerateLocationCertificate(result, yearName),
    }))

    return {
      documentNumber: normalizedDocument,
      student: {
        names: activeRequest.student.names,
        lastNames: activeRequest.student.lastNames,
        documentNumber: activeRequest.student.documentNumber,
      },
      activeRequestId: activeRequest.id,
      results,
      yearName,
      cargo: toLocationCargo(activeRequest),
      cargoTexts: context.texts,
      textStatus: context.textStatus,
    }
  }
}
