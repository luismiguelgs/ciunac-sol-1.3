'use client'

import type { SolicitudConstancia } from './model'
import { registerConstancia, findConstanciaStudent as findStudent, getConstanciaCargo as getCargo } from './operations'
import {
  createConstanciaRequest,
  fetchConstanciaCargo,
  fetchConstanciaStudent,
  saveConstanciaStudent,
  sendConstanciaNotification,
} from './infrastructure/constancia-client'

export function registerSolicitudConstancia({ solicitud }: { solicitud: SolicitudConstancia }) {
  return registerConstancia(solicitud, {
    saveStudent: saveConstanciaStudent,
    createRequest: createConstanciaRequest,
    sendNotification: sendConstanciaNotification,
  })
}

export function retrySolicitudConstanciaNotification(requestId: string) {
  return sendConstanciaNotification(requestId)
}

export function findConstanciaStudent(documentNumber: string) {
  return findStudent(documentNumber, fetchConstanciaStudent)
}

export function getConstanciaCargo(requestId: number) {
  return getCargo(requestId, fetchConstanciaCargo)
}
