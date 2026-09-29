import 'server-only'

import {
  type CertificateDetail,
  sortCertificateNotes,
} from '@/modules/consulta-certificado/domain/certificate-detail'
import {
  normalizeCertificateLookupId,
  parseCertificateDetailResponse,
} from '@/modules/consulta-certificado/infrastructure/certificate-detail.contract'
import { ciunacRequest } from '@/modules/security/server/ciunac-client'
import { SecurityError } from '@/modules/security/server/security-error'

export type GetCertificateDetailInput = {
  certificateId: string
}

export async function getCertificateDetail(
  input: GetCertificateDetailInput,
): Promise<CertificateDetail | null> {
  const certificateId = normalizeCertificateLookupId(input.certificateId)
  if (!certificateId) return null

  let response: unknown
  try {
    response = await ciunacRequest<unknown>(`certificados/${certificateId}`)
  } catch (error) {
    if (error instanceof SecurityError && error.status === 404) return null
    throw error
  }

  if (response === null) return null

  const certificate = parseCertificateDetailResponse(response, certificateId)
  return {
    ...certificate,
    notes: sortCertificateNotes(certificate.notes),
  }
}
