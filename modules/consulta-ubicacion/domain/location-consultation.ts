export type LocationText = {
  code: string
  content: string
}

export type LocationRequest = {
  id: number
  student: {
    id: string
    names: string
    lastNames: string
    documentNumber: string
  }
  requestType: {
    id: number
    name: string
  }
  language: {
    id: number
    name: string
  }
  level: {
    id: number
    name: string
  }
  createdAt: string
  payment: {
    amount: number
    voucherNumber: string | null
    paidAt: string | null
  }
}

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

export type LocationCargo = {
  requestId: number
  requestTypeName: string
  createdAt: string
  student: LocationRequest['student']
  languageName: string
  levelName: string
  amount: number
  voucherNumber: string | null
  paidAt: string | null
}

export function normalizeLocationDocument(value: string): string | null {
  const documentNumber = value.trim().toUpperCase()
  return /^[A-Z0-9]{8,9}$/.test(documentNumber) ? documentNumber : null
}

export function findLocationText(texts: LocationText[], code: string): string | null {
  return texts.find((item) => item.code === code)?.content ?? null
}

export function selectLatestLocationRequest(requests: LocationRequest[]): LocationRequest | null {
  return [...requests].sort((left, right) => {
    const dateDifference = Date.parse(right.createdAt) - Date.parse(left.createdAt)
    return dateDifference || right.id - left.id
  })[0] ?? null
}

export function toLocationCargo(request: LocationRequest): LocationCargo {
  return {
    requestId: request.id,
    requestTypeName: request.requestType.name,
    createdAt: request.createdAt,
    student: request.student,
    languageName: request.language.name,
    levelName: request.level.name,
    amount: request.payment.amount,
    voucherNumber: request.payment.voucherNumber,
    paidAt: request.payment.paidAt,
  }
}

export function joinLocationExamResults(
  records: LocationPlacementRecord[],
  exams: LocationExam[],
  cycles: LocationCycle[],
  locationRequests: LocationRequest[],
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
        student: record.student ?? request.student,
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
