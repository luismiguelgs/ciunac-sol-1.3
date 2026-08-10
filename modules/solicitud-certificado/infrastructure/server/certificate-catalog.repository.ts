import 'server-only'

import { AppError } from '@/modules/shared/application/errors/app-error'
import { ciunacRequest } from '@/modules/security/server/ciunac-client'
import { parseExternalResponse } from '@/modules/shared/infrastructure/validation/external-response'
import { CertificateCatalogs, CertificateText, CertificateType } from '@/modules/solicitud-certificado/domain/solicitud-certificado'
import { toCertificateCatalogs, toCertificateType } from '@/modules/solicitud-certificado/infrastructure/mappers/certificate-api.mapper'
import {
  certificateFacultyArraySchema,
  certificateLanguageArraySchema,
  certificateSchoolArraySchema,
  certificateTextArraySchema,
  certificateTypeArraySchema,
} from '@/modules/solicitud-certificado/infrastructure/validation/certificate-api.schemas'

export async function getCertificateTypes(): Promise<CertificateType[]> {
  const response = await ciunacRequest<unknown>('tipossolicitud')
  const types = parseExternalResponse(
    certificateTypeArraySchema,
    filterCertificateTypes(response),
    'La API devolvio un tarifario de certificados vacio o invalido.',
  )
  return types.map(toCertificateType)
}

export async function getCertificateCatalogs(): Promise<CertificateCatalogs> {
  const [typesResponse, languagesResponse, facultiesResponse, schoolsResponse, textsResponse] = await Promise.all([
    ciunacRequest<unknown>('tipossolicitud'),
    ciunacRequest<unknown>('idiomas'),
    ciunacRequest<unknown>('facultades'),
    ciunacRequest<unknown>('escuelas'),
    ciunacRequest<unknown>('textos'),
  ])

  const types = parseExternalResponse(
    certificateTypeArraySchema,
    filterCertificateTypes(typesResponse),
    'La API devolvio un tarifario de certificados vacio o invalido.',
  )
  const languages = parseExternalResponse(
    certificateLanguageArraySchema,
    languagesResponse,
    'La API devolvio un catalogo de idiomas vacio o invalido.',
  )
  const faculties = parseExternalResponse(
    certificateFacultyArraySchema,
    facultiesResponse,
    'La API devolvio un catalogo de facultades vacio o invalido.',
  )
  const schools = parseExternalResponse(
    certificateSchoolArraySchema,
    schoolsResponse,
    'La API devolvio un catalogo de escuelas vacio o invalido.',
  )
  const texts = parseExternalResponse(
    certificateTextArraySchema,
    textsResponse,
    'La API devolvio un catalogo de textos vacio o invalido.',
  )

  const facultyIds = new Set(faculties.map((item) => item.id))
  if (schools.some((school) => !facultyIds.has(school.facultadId))) {
    throw new AppError({
      code: 'EXTERNAL_SERVICE',
      message: 'El catalogo academico contiene relaciones invalidas.',
    })
  }

  return toCertificateCatalogs(types, languages, faculties, schools, texts)
}

export async function getCertificateTexts(): Promise<CertificateText[]> {
  const response = await ciunacRequest<unknown>('textos')
  return parseExternalResponse(
    certificateTextArraySchema,
    response,
    'La API devolvio un catalogo de textos vacio o invalido.',
  ).map((item) => ({ code: item.codigo, content: item.contenido }))
}

function filterCertificateTypes(value: unknown): unknown {
  if (!Array.isArray(value)) return value
  return value.filter((item) => {
    if (!item || typeof item !== 'object') return false
    const id = Number((item as { id?: unknown }).id)
    return id >= 1 && id <= 4
  })
}
