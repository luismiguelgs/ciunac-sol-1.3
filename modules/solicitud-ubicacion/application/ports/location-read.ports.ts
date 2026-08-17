import type {
  LocationCargo,
  LocationStudentLookup,
} from '@/modules/solicitud-ubicacion/domain/solicitud-ubicacion'

export interface LocationStudentLookupPort {
  findByDocument(documentNumber: string): Promise<LocationStudentLookup | null>
}

export interface LocationCargoPort {
  findById(requestId: number): Promise<LocationCargo | null>
}
