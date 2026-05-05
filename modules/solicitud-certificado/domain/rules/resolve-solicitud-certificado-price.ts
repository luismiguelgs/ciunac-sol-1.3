import { ITipoSolicitud } from '@/modules/shared/interfaces/types.interface';

export function resolveSolicitudCertificadoPrice(
  tipoSolicitudId: string,
  certificados?: ITipoSolicitud[]
): string {
  const match = certificados?.find((certificado) => certificado.id === Number(tipoSolicitudId));
  return match ? String(match.precio) : '0';
}
