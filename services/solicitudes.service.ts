import Isolicitud, { ISolicitudRes } from '@/interfaces/solicitud.interface';
import { apiFetch } from '@/lib/api.service';
import { obtenerPeriodo } from '@/lib/utils';
import ISolicitudBeca from '@/modules/solicitud-beca/interfaces/solicitudbeca.interface';

export default class SolicitudesService {
    private static collection = 'solicitudes'

    public static async searchItemByDni(dni: string): Promise<ISolicitudRes[]> {
        const response = await apiFetch<ISolicitudRes[]>(`${this.collection}/documento/${dni}`, 'GET')
        return response
    }

    public static async newItem(data: Isolicitud): Promise<string | null> {
        const solicitudData = {
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
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await apiFetch<any>(`${this.collection}`, 'POST', solicitudData)
        return response.id
    }

    public static async getItemId(id: number): Promise<ISolicitudRes> {
        const response = await apiFetch<ISolicitudRes>(`${this.collection}/${id}`, 'GET')
        return response
    }

    public static async newBeca(data: ISolicitudBeca): Promise<string | undefined> {
        const solicitudData = {
            ...data,
            apellidos: data.apellidos.toLocaleUpperCase(),
            nombres: data.nombres.toLocaleUpperCase(),
            direccion: data.direccion.toLocaleUpperCase(),
            periodo: obtenerPeriodo(),
        }
        const response = await apiFetch<ISolicitudBeca>(`solicitudbecas`, 'POST', solicitudData)
        console.log(response)
        return response?._id
    }
}