import {
  canGenerateLocationCertificate,
  findLocationText,
  joinLocationExamResults,
  normalizeLocationDocument,
  selectLatestLocationRequest,
  toLocationCargo,
  type LocationCargo,
  type LocationContext,
  type LocationCycle,
  type LocationExam,
  type LocationPlacementRecord,
  type LocationExamResult,
  type LocationText,
} from './model'
import { AppError } from '@/modules/shared/application/errors/app-error'

type Dependencies = {
  loadContext: (documentNumber: string) => Promise<LocationContext>
  findPlacements: (documentNumber: string) => Promise<LocationPlacementRecord[]>
  listExams: () => Promise<LocationExam[]>
  listCycles: () => Promise<LocationCycle[]>
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

export async function loadLocationConsultation(
  documentNumber: string,
  dependencies: Dependencies,
): Promise<LocationConsultationResult | null> {
  const normalizedDocument = normalizeLocationDocument(documentNumber)
  if (!normalizedDocument) {
    throw new AppError({
      code: 'VALIDATION',
      status: 400,
      message: 'El número de documento no es válido.',
    })
  }

  const [context, placements, exams, cycles] = await Promise.all([
    dependencies.loadContext(normalizedDocument),
    dependencies.findPlacements(normalizedDocument),
    dependencies.listExams(),
    dependencies.listCycles(),
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
