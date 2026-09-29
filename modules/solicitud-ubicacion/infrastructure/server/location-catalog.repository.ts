import 'server-only'

import { AppError } from '@/modules/shared/application/errors/app-error'
import { ciunacRequest } from '@/modules/security/server/ciunac-client'
import { parseExternalResponse } from '@/modules/shared/infrastructure/validation/external-response'
import {
  LocationCatalogs,
  LocationSchedule,
  LocationRequestType,
  LocationText,
  isOfficialLocationPrice,
} from '../../model'
import { toLocationCatalogs, toLocationSchedule } from '../location-api.mapper'
import {
  locationLanguageArraySchema,
  locationScheduleArraySchema,
  locationTextArraySchema,
  locationTypeArraySchema,
  filterLocationTypeResponse,
} from '../location-api.schemas'

export async function getLocationCatalogs(): Promise<LocationCatalogs> {
  const [typesResponse, languagesResponse, textsResponse] = await Promise.all([
    ciunacRequest<unknown>('tipossolicitud'),
    ciunacRequest<unknown>('idiomas'),
    ciunacRequest<unknown>('textos'),
  ])
  const types = parseExternalResponse(
    locationTypeArraySchema,
    filterLocationTypeResponse(typesResponse),
    'La API devolvio un tarifario de ubicacion vacio o invalido.',
  )
  assertOfficialPrice(types[0].precio)
  const languages = parseExternalResponse(
    locationLanguageArraySchema,
    languagesResponse,
    'La API devolvio un catalogo de idiomas vacio o invalido.',
  )
  const texts = parseExternalResponse(
    locationTextArraySchema,
    textsResponse,
    'La API devolvio un catalogo de textos vacio o invalido.',
  )
  return toLocationCatalogs(types[0], languages, texts)
}

export async function getLocationEntryData(): Promise<{
  requestType: LocationRequestType; texts: LocationText[]; schedules: LocationSchedule[]
}> {
  const [typesResponse, texts, schedulesResponse] = await Promise.all([
    ciunacRequest<unknown>('tipossolicitud'),
    getLocationTexts(),
    ciunacRequest<unknown>('cronogramaubicacion'),
  ])
  const [type] = parseExternalResponse(locationTypeArraySchema, filterLocationTypeResponse(typesResponse),
    'La API devolvio un tarifario de ubicacion vacio o invalido.')
  assertOfficialPrice(type.precio)
  const schedules = parseExternalResponse(
    locationScheduleArraySchema,
    schedulesResponse,
    'La API devolvio cronogramas de ubicacion invalidos.',
  ).map(toLocationSchedule)
  return { requestType: { id: type.id, name: type.solicitud, price: type.precio }, texts, schedules }
}

export async function getLocationTexts(): Promise<LocationText[]> {
  const response = await ciunacRequest<unknown>('textos')
  return parseExternalResponse(
    locationTextArraySchema,
    response,
    'La API devolvio textos de ubicacion invalidos.',
  ).map((item) => ({ code: item.codigo, content: item.contenido }))
}

function assertOfficialPrice(price: number): void {
  if (!isOfficialLocationPrice(price)) {
    throw new AppError({
      code: 'EXTERNAL_SERVICE',
      status: 503,
      message: 'El tarifario del examen de ubicacion no coincide con la tarifa oficial.',
    })
  }
}
