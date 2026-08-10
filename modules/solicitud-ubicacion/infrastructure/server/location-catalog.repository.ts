import 'server-only'

import { AppError } from '@/modules/shared/application/errors/app-error'
import { ciunacRequest } from '@/modules/security/server/ciunac-client'
import { parseExternalResponse } from '@/modules/shared/infrastructure/validation/external-response'
import {
  LocationCatalogs,
  LocationSchedule,
  LocationText,
  isOfficialLocationPrice,
} from '@/modules/solicitud-ubicacion/domain/solicitud-ubicacion'
import { toLocationCatalogs, toLocationSchedule } from '@/modules/solicitud-ubicacion/infrastructure/mappers/location-api.mapper'
import {
  locationLanguageArraySchema,
  locationScheduleArraySchema,
  locationTextArraySchema,
  locationTypeArraySchema,
} from '@/modules/solicitud-ubicacion/infrastructure/validation/location-api.schemas'

export async function getLocationCatalogs(): Promise<LocationCatalogs> {
  const [typesResponse, languagesResponse, textsResponse] = await Promise.all([
    ciunacRequest<unknown>('tipossolicitud'),
    ciunacRequest<unknown>('idiomas'),
    ciunacRequest<unknown>('textos'),
  ])
  const types = parseExternalResponse(
    locationTypeArraySchema,
    filterLocationType(typesResponse),
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

export async function getLocationEntryData(): Promise<{ catalogs: LocationCatalogs; schedules: LocationSchedule[] }> {
  const [catalogs, schedulesResponse] = await Promise.all([
    getLocationCatalogs(),
    ciunacRequest<unknown>('cronogramaubicacion'),
  ])
  const schedules = parseExternalResponse(
    locationScheduleArraySchema,
    schedulesResponse,
    'La API devolvio cronogramas de ubicacion invalidos.',
  ).map(toLocationSchedule)
  return { catalogs, schedules }
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

function filterLocationType(value: unknown): unknown {
  if (!Array.isArray(value)) return value
  return value.filter((item) => item && typeof item === 'object' && Number((item as { id?: unknown }).id) === 7)
}
