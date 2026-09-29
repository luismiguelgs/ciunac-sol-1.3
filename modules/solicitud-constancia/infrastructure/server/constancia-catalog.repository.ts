import 'server-only'

import { AppError } from '@/modules/shared/application/errors/app-error'
import { ciunacRequest } from '@/modules/security/server/ciunac-client'
import { parseExternalResponse } from '@/modules/shared/infrastructure/validation/external-response'
import type {
  ConstanciaCatalogs,
  ConstanciaText,
  ConstanciaType,
} from '../../model'
import {
  hasConsistentConstanciaCatalogs,
} from '../../model'
import {
  toConstanciaCatalogs,
  toConstanciaType,
} from '../constancia-api.mapper'
import {
  constanciaFacultyArraySchema,
  constanciaLanguageArraySchema,
  constanciaSchoolArraySchema,
  constanciaTextArraySchema,
  constanciaTypeArraySchema,
} from '../constancia-api.schemas'

export async function getConstanciaTypes(): Promise<ConstanciaType[]> {
  const response = await ciunacRequest<unknown>('tipossolicitud')
  return parseExternalResponse(
    constanciaTypeArraySchema,
    response,
    'La API devolvio un tarifario de constancias vacio o invalido.',
  ).map(toConstanciaType)
}

export async function getConstanciaCatalogs(): Promise<ConstanciaCatalogs> {
  const [typesResponse, languagesResponse, facultiesResponse, schoolsResponse, textsResponse] = await Promise.all([
    ciunacRequest<unknown>('tipossolicitud'),
    ciunacRequest<unknown>('idiomas'),
    ciunacRequest<unknown>('facultades'),
    ciunacRequest<unknown>('escuelas'),
    ciunacRequest<unknown>('textos'),
  ])

  const types = parseExternalResponse(
    constanciaTypeArraySchema,
    typesResponse,
    'La API devolvio un tarifario de constancias vacio o invalido.',
  )
  const languages = parseExternalResponse(
    constanciaLanguageArraySchema,
    languagesResponse,
    'La API devolvio un catalogo de idiomas vacio o invalido.',
  )
  const faculties = parseExternalResponse(
    constanciaFacultyArraySchema,
    facultiesResponse,
    'La API devolvio un catalogo de facultades vacio o invalido.',
  )
  const schools = parseExternalResponse(
    constanciaSchoolArraySchema,
    schoolsResponse,
    'La API devolvio un catalogo de escuelas vacio o invalido.',
  )
  const texts = parseExternalResponse(
    constanciaTextArraySchema,
    textsResponse,
    'La API devolvio un catalogo de textos vacio o invalido.',
  )

  const catalogs = toConstanciaCatalogs(types, languages, faculties, schools, texts)
  if (!hasConsistentConstanciaCatalogs(catalogs)) {
    throw new AppError({
      code: 'EXTERNAL_SERVICE',
      message: 'El catalogo academico contiene relaciones invalidas.',
    })
  }
  return catalogs
}

export async function getConstanciaTexts(): Promise<ConstanciaText[]> {
  const response = await ciunacRequest<unknown>('textos')
  return parseExternalResponse(
    constanciaTextArraySchema,
    response,
    'La API devolvio un catalogo de textos vacio o invalido.',
  ).map((item) => ({ code: item.codigo, content: item.contenido }))
}
