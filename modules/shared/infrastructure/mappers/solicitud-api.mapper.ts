import Isolicitud from '@/modules/shared/interfaces/solicitud.interface';
import ISolicitudBeca from '@/modules/solicitud-beca/interfaces/solicitudbeca.interface';
import { obtenerPeriodo } from '@/lib/utils';

export function toSolicitudRequestDto(data: Isolicitud) {
  return {
    estudianteId: data.estudianteId,
    tipoSolicitudId: +data.tipo_solicitud,
    idiomaId: +data.idioma,
    nivelId: +data.nivel,
    estadoId: 1,
    periodo: obtenerPeriodo(),
    alumnoCiunac: data.alumno_ciunac,
    fechaPago: data.fecha_pago,
    pago: +data.pago,
    digital: data.digital,
    numeroVoucher: data.numero_voucher,
    imgCertEstudio: data.img_cert_estudio,
    imgVoucher: data.img_voucher,
  };
}

export function toSolicitudBecaRequestDto(data: ISolicitudBeca) {
  return {
    ...data,
    apellidos: data.apellidos.toLocaleUpperCase(),
    nombres: data.nombres.toLocaleUpperCase(),
    direccion: data.direccion.toLocaleUpperCase(),
    periodo: obtenerPeriodo(),
  };
}
