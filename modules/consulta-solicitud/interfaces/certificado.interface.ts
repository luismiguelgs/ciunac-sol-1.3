export interface Icertificado{
    id?:string,
    impreso: boolean,
    alumno: string,
    tipo: 'virtual' | 'fisico'
    id_solicitud?: string,
    idioma: string,
    nivel: string,
    horas: number,
    fecha_emision: Date,
    numero_registro : string,
    fecha_conclusion: Date,
    elaborador?: string,
    duplicado?: boolean,
    certificado_anterior?: string,
    curricula_antigua?: boolean,
    dni?: string,
    url?: string,
    aceptacion?: boolean
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fecha_aceptacion?: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    creado?: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    modificado?: any
    
}
export interface IcertificadoDetalle{
    id?: string,
    id_certificado: string,
    curso: string,
    ciclo: string,
    modalidad: string
    nota: number,
    isNew?: boolean
}