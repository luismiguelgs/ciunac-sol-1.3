export interface IConstancia {
    _id?: string
    id?: string
    id_solicitud?: string | number
    solicitudId: number
    dni?: string
    numeroDocumento?: string
    tipo?: string
    url?: string
    aceptado?: boolean
    fechaEmision?: string
    fechaAceptacion?: string
}
