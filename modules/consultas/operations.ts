import {
  type ConsultationType,
  type ConsultedRequest,
  type ConsultationText,
  matchesConsultationType,
  normalizeConsultationDocument,
} from './model'

type Dependencies = {
  findRequests: (documentNumber: string) => Promise<ConsultedRequest[]>
  listTexts: () => Promise<ConsultationText[]>
}

export type ConsultationRequestsResult = {
  documentNumber: string
  requests: ConsultedRequest[]
  texts: ConsultationText[]
  textStatus: 'available' | 'unavailable'
}

export async function loadConsultationRequests(
  documentNumber: string,
  type: ConsultationType,
  dependencies: Dependencies,
): Promise<ConsultationRequestsResult> {
  const normalizedDocument = normalizeConsultationDocument(documentNumber)
  const [requests, textResult] = await Promise.all([
    dependencies.findRequests(normalizedDocument),
    dependencies.listTexts()
      .then((texts) => ({ ok: true as const, texts }))
      .catch(() => ({ ok: false as const, texts: [] as ConsultationText[] })),
  ])

  return {
    documentNumber: normalizedDocument,
    requests: requests.filter((request) => matchesConsultationType(request, type)),
    texts: textResult.texts,
    textStatus: textResult.ok ? 'available' : 'unavailable',
  }
}
