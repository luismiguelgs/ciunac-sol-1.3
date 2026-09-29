'use client'

import {
  registerLocation, checkDuplicateLocation,
  findLocationStudent as findStudent, getLocationCargo as getCargo,
} from './operations'
import type { SolicitudUbicacion } from './model'
import {
  saveLocationStudent, createLocationRequest, sendLocationNotification,
  findLocationRequests, findStudentByDocument, findCargoById,
} from './infrastructure/location-client'

export { saveLocationProfile } from './infrastructure/location-client'

export function registerSolicitudUbicacion({ solicitud }: { solicitud: SolicitudUbicacion }) {
  return registerLocation(solicitud, {
    saveStudent: saveLocationStudent,
    createRequest: createLocationRequest,
    sendNotification: sendLocationNotification,
  })
}

export function retrySolicitudUbicacionNotification(requestId: string) {
  return sendLocationNotification(requestId)
}

export function checkDuplicateSolicitudUbicacion(input: { documentNumber: string; languageId: number }) {
  return checkDuplicateLocation(input, findLocationRequests)
}

export function findLocationStudent(documentNumber: string) {
  return findStudent(documentNumber, findStudentByDocument)
}

export function getLocationCargo(requestId: number) {
  return getCargo(requestId, findCargoById)
}
