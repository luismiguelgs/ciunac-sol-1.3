import type {
  LocationCycle,
  LocationExam,
  LocationPlacementRecord,
  LocationRequest,
  LocationText,
} from '@/modules/consulta-ubicacion/domain/location-consultation'

export interface LocationContextPort {
  load(documentNumber: string): Promise<{
    requests: LocationRequest[]
    texts: LocationText[]
    textStatus: 'available' | 'unavailable'
  }>
}

export interface LocationPlacementPort {
  findByDocument(documentNumber: string): Promise<LocationPlacementRecord[]>
}

export interface LocationExamPort {
  list(): Promise<LocationExam[]>
}

export interface LocationCyclePort {
  list(): Promise<LocationCycle[]>
}
