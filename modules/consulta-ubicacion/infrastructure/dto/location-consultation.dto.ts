export type LocationExamResponseDto = {
  id: number
  fecha: string
}

export type LocationCycleResponseDto = {
  id: number
  nombre: string
}

export type LocationPlacementResponseDto = {
  id: number
  examenId: number
  solicitudId: number
  nota: number
  terminado: boolean
  estudiante: {
    id: string
    nombres: string
    apellidos: string
    numeroDocumento: string
  } | null
  idioma: { id: number; nombre: string }
  nivel: { id: number; nombre: string }
  calificacion: { cicloId: number } | null
}
