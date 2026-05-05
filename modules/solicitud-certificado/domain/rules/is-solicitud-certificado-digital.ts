export function isSolicitudCertificadoDigital(tipoSolicitudId: string): boolean {
  return tipoSolicitudId !== '1' && tipoSolicitudId !== '3';
}
