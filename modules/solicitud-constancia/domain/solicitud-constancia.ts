export const CONSTANCIA_TYPE_IDS = [5, 6] as const

export type SolicitudConstanciaDraft = {
  email: string
  tipoSolicitudId: number
  idiomaId: number
  nivelId: number
  nombres: string
  apellidos: string
  tipoDocumento: 'DNI' | 'CE' | 'PASAPORTE'
  numeroDocumento: string
  celular: string
  estudianteId?: string
  alumnoUnac: boolean
  facultadId?: number
  escuelaId?: number
  codigo?: string
  pago: number
  numeroVoucher?: string
  fechaPago?: string
  voucherUrl?: string
}

export function isConstanciaType(value: number): boolean {
  return CONSTANCIA_TYPE_IDS.includes(value as (typeof CONSTANCIA_TYPE_IDS)[number])
}

export function validateSolicitudConstancia(solicitud: SolicitudConstanciaDraft): string | null {
  if (!isConstanciaType(solicitud.tipoSolicitudId)) {
    return 'El tipo de solicitud no corresponde a una constancia.'
  }
  if (!Number.isFinite(solicitud.pago) || solicitud.pago < 0) {
    return 'El monto de pago no es valido.'
  }
  if (
    solicitud.pago > 0
    && (!/^\d{15}$/.test(solicitud.numeroVoucher ?? '') || !solicitud.fechaPago || !solicitud.voucherUrl)
  ) {
    return 'Los datos del voucher estan incompletos.'
  }
  return null
}
