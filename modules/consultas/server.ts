import 'server-only'

import { loadConsultationRequests } from './operations'
import {
  matchesConsultationType,
  normalizeConsultationDocument,
  type ConsultationType,
} from './model'
import {
  findRequestsByDocument,
  listConsultationTexts,
} from './infrastructure/server/consultation.repository'

type ConsultationQuery = {
  documentNumber: string
  type: ConsultationType
}

// The CAPTCHA gate needs requests only, not the auxiliary texts used by results.
export async function findConsultationRequests(query: ConsultationQuery) {
  const documentNumber = normalizeConsultationDocument(query.documentNumber)
  const requests = await findRequestsByDocument(documentNumber)
  return {
    documentNumber,
    requests: requests.filter((request) => matchesConsultationType(request, query.type)),
  }
}

export function getConsultationRequests(query: ConsultationQuery) {
  return loadConsultationRequests(query.documentNumber, query.type, {
    findRequests: findRequestsByDocument,
    listTexts: listConsultationTexts,
  })
}
