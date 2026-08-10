import {
  ConsultationType,
  ConsultedRequest,
  matchesConsultationType,
  normalizeConsultationDocument,
} from '@/modules/consultas/domain/consulted-request'
import { ConsultationText } from '@/modules/consultas/domain/consultation-text'

export interface ConsultationRequestPort {
  findByDocument(documentNumber: string): Promise<ConsultedRequest[]>
}

export interface ConsultationTextPort {
  list(): Promise<ConsultationText[]>
}

type Dependencies = {
  requests: ConsultationRequestPort
  texts: ConsultationTextPort
}

export type ConsultationRequestsResult = {
  documentNumber: string
  requests: ConsultedRequest[]
  texts: ConsultationText[]
  textStatus: 'available' | 'unavailable'
}

export class GetConsultationRequestsUseCase {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(documentNumber: string, type: ConsultationType): Promise<ConsultationRequestsResult> {
    const normalizedDocument = normalizeConsultationDocument(documentNumber)
    const [requests, textResult] = await Promise.all([
      this.dependencies.requests.findByDocument(normalizedDocument),
      this.dependencies.texts.list()
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
}
