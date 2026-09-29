'use client'

import { registerScholarship } from './operations'
import type { SolicitudBeca } from './model'
import {
  createScholarshipRequest,
  sendScholarshipNotification,
} from './infrastructure/scholarship-client'

const dependencies = {
  createRequest: createScholarshipRequest,
  sendNotification: sendScholarshipNotification,
}

export function registerSolicitudBeca(solicitud: SolicitudBeca) {
  return registerScholarship(solicitud, dependencies)
}

export function retrySolicitudBecaNotification(requestId: string) {
  return sendScholarshipNotification(requestId)
}
