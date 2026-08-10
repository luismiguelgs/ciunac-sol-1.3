import { ConsultedRequest } from '@/modules/consultas/domain/consulted-request'
import { ConsultationText } from '@/modules/consultas/domain/consultation-text'

export type LocationExam = {
  id: number
  occurredAt: string
}

export type LocationCycle = {
  id: number
  name: string
}

export type LocationStudent = {
  id: string
  names: string
  lastNames: string
  documentNumber: string
}

export type LocationPlacementRecord = {
  id: number
  examId: number
  requestId: number
  grade: number
  completed: boolean
  student: LocationStudent | null
  language: { id: number; name: string }
  evaluatedLevel: { id: number; name: string }
  cycleId: number | null
}

export type LocationExamResult = {
  id: number
  examId: number
  requestId: number
  grade: number
  completed: boolean
  student: LocationStudent
  language: LocationPlacementRecord['language']
  evaluatedLevel: LocationPlacementRecord['evaluatedLevel']
  examDate: string | null
  placementCycle: string | null
  dataQuality: 'complete' | 'partial'
}

export type LocationConsultation = {
  documentNumber: string
  student: {
    names: string
    lastNames: string
    documentNumber: string
  }
  activeRequestId: number
  results: LocationExamResult[]
  yearName: string | null
  cargoTexts: ConsultationText[]
  textStatus: 'available' | 'unavailable'
}

export function selectLatestLocationRequest(requests: ConsultedRequest[]): ConsultedRequest | null {
  return [...requests].sort((left, right) => {
    const dateDifference = Date.parse(right.createdAt) - Date.parse(left.createdAt)
    return dateDifference || right.id - left.id
  })[0] ?? null
}

export function joinLocationExamResults(
  records: LocationPlacementRecord[],
  exams: LocationExam[],
  cycles: LocationCycle[],
  locationRequests: ConsultedRequest[],
  documentNumber: string,
): LocationExamResult[] {
  const normalizedDocument = documentNumber.trim().toUpperCase()
  const examById = new Map(exams.map((exam) => [exam.id, exam]))
  const cycleById = new Map(cycles.map((cycle) => [cycle.id, cycle]))
  const requestById = new Map(locationRequests.map((request) => [request.id, request]))

  return records
    .flatMap<LocationExamResult>((record) => {
      const request = requestById.get(record.requestId)
      if (!request || request.student.documentNumber.trim().toUpperCase() !== normalizedDocument) return []
      if (record.student && record.student.documentNumber.trim().toUpperCase() !== normalizedDocument) return []

      const examDate = examById.get(record.examId)?.occurredAt ?? null
      const placementCycle = record.cycleId === null ? null : cycleById.get(record.cycleId)?.name ?? null

      return [{
        id: record.id,
        examId: record.examId,
        requestId: record.requestId,
        grade: record.grade,
        completed: record.completed,
        student: record.student ?? {
          id: request.student.id,
          names: request.student.names,
          lastNames: request.student.lastNames,
          documentNumber: request.student.documentNumber,
        },
        language: record.language,
        evaluatedLevel: record.evaluatedLevel,
        examDate,
        placementCycle,
        dataQuality: examDate && placementCycle ? 'complete' : 'partial',
      }]
    })
    .sort((left, right) => {
      const leftDate = left.examDate ? Date.parse(left.examDate) : 0
      const rightDate = right.examDate ? Date.parse(right.examDate) : 0
      return rightDate - leftDate || right.id - left.id
    })
}

export function canGenerateLocationCertificate(result: LocationExamResult, yearName: string | null): boolean {
  return result.completed && result.dataQuality === 'complete' && Boolean(yearName?.trim())
}
