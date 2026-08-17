import type {
  ConstanciaCargo,
  ConstanciaStudentLookup,
} from '@/modules/solicitud-constancia/domain/solicitud-constancia'

export interface ConstanciaStudentLookupPort {
  findByDocument(documentNumber: string): Promise<ConstanciaStudentLookup | null>
}

export interface ConstanciaCargoPort {
  findById(requestId: number): Promise<ConstanciaCargo | null>
}
