'use client'

import {
  registerCertificate,
  findCertificateStudent as findStudent,
  getCertificateCargo as getCargo,
} from './operations'
import type { SolicitudCertificado } from './model'
import {
  createCertificateRequest,
  fetchCertificateCargo,
  fetchCertificateStudent,
  saveCertificateStudent,
  sendCertificateNotification,
} from './infrastructure/certificate-client'

export function registerSolicitudCertificado({ solicitud }: { solicitud: SolicitudCertificado }) {
  return registerCertificate(solicitud, {
    saveStudent: saveCertificateStudent,
    createRequest: createCertificateRequest,
    sendNotification: sendCertificateNotification,
  })
}

export function retrySolicitudCertificadoNotification(requestId: string) {
  return sendCertificateNotification(requestId)
}

export function findCertificateStudent(documentNumber: string) {
  return findStudent(documentNumber, fetchCertificateStudent)
}

export function getCertificateCargo(requestId: number) {
  return getCargo(requestId, fetchCertificateCargo)
}
