import 'server-only'

import { loadLocationConsultation } from './operations'
import {
  loadLocationContext,
  findLocationPlacements,
  listLocationExams,
  listLocationCycles,
} from './infrastructure/server/location-consultation.repository'

export function getLocationConsultation({ documentNumber }: { documentNumber: string }) {
  return loadLocationConsultation(documentNumber, {
    loadContext: loadLocationContext,
    findPlacements: findLocationPlacements,
    listExams: listLocationExams,
    listCycles: listLocationCycles,
  })
}
