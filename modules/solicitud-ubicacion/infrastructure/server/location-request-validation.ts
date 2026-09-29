import 'server-only'

import { NextRequest } from 'next/server'
import { ciunacRequest } from '@/modules/security/server/ciunac-client'
import type { VerifiedSession } from '@/modules/security/server/session'
import { SecurityError } from '@/modules/security/server/security-error'
import {
  hasPendingLocationRequest,
  isOfficialLocationPrice,
} from '../../model'
import { readLocationProfileFromRequest } from './location-profile-session'
import { toExistingLocationRequest } from '../location-api.mapper'
import {
  locationCreateCommandDtoSchema,
  locationDuplicateResponseArraySchema,
  locationStudentRequestDtoSchema,
  locationTypeArraySchema,
  filterLocationTypeResponse,
  type LocationRequestDto,
  type LocationStudentRequestDto,
} from '../location-api.schemas'

export async function validateLocationRequest(
  request: NextRequest,
  value: unknown,
  session: VerifiedSession | null,
): Promise<LocationRequestDto> {
  if (session?.purpose !== 'UBICACION') {
    throw new SecurityError('FORBIDDEN', 403, 'Location request requires an UBICACION session')
  }

  const result = locationCreateCommandDtoSchema.safeParse(value)
  if (!result.success) throw new SecurityError('INVALID_REQUEST', 400, 'Location request payload is invalid')
  const profile = readLocationProfileFromRequest(request)
  if (!profile || profile.isCiunacStudent !== result.data.request.alumnoCiunac) {
    throw new SecurityError('FORBIDDEN', 403, 'Location profile does not match request')
  }

  const catalogResponse = await ciunacRequest<unknown>('tipossolicitud')
  const catalog = locationTypeArraySchema.safeParse(filterLocationTypeResponse(catalogResponse))
  if (!catalog.success || !isOfficialLocationPrice(catalog.data[0].precio)) {
    throw new SecurityError('SERVICE_UNAVAILABLE', 503, 'Location price catalog is inconsistent')
  }
  if (!isOfficialLocationPrice(result.data.request.pago)) {
    throw new SecurityError('PRICE_CHANGED', 409, 'Location price does not match official price')
  }

  await assertNoDuplicate(result.data.documentNumber, result.data.request.idiomaId)
  return result.data.request
}

export function validateLocationStudentRequest(
  request: NextRequest,
  value: unknown,
  session: VerifiedSession | null,
): LocationStudentRequestDto {
  if (session?.purpose !== 'UBICACION') {
    throw new SecurityError('FORBIDDEN', 403, 'Location student requires an UBICACION session')
  }
  if (!readLocationProfileFromRequest(request)) {
    throw new SecurityError('FORBIDDEN', 403, 'Location profile is missing')
  }
  const result = locationStudentRequestDtoSchema.safeParse(value)
  if (!result.success) throw new SecurityError('INVALID_REQUEST', 400, 'Location student payload is invalid')
  if (result.data.email.toLowerCase() !== session.email.toLowerCase()) {
    throw new SecurityError('FORBIDDEN', 403, 'Student email does not match verified session')
  }
  return result.data
}

async function assertNoDuplicate(documentNumber: string, languageId: number): Promise<void> {
  const response = await ciunacRequest<unknown>(`solicitudes/documento/${documentNumber}`)
  const result = locationDuplicateResponseArraySchema.safeParse(response)
  if (!result.success) throw new SecurityError('SERVICE_UNAVAILABLE', 503, 'Duplicate request response is invalid')
  const duplicate = hasPendingLocationRequest(result.data.map(toExistingLocationRequest), languageId)
  if (duplicate) throw new SecurityError('DUPLICATE_REQUEST', 409, 'A location request is already in progress')
}
