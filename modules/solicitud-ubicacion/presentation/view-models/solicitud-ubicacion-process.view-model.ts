import { IBasicInfoSchema } from '@/modules/solicitud-ubicacion/schemas/basic-data.schema';
import { IFinInfoSchema } from '@/modules/shared/schemas/fin-data.schema';

export type SolicitudUbicacionStep = 'Datos bÃ¡sicos' | 'Datos de Pago' | 'Documentos' | 'Finalizar';

export type SolicitudUbicacionDocumentPayload = {
  img_cert_estudio: string;
  img_cert_trabajo: string;
};

export type SolicitudUbicacionStepPayload =
  | IBasicInfoSchema
  | IFinInfoSchema
  | SolicitudUbicacionDocumentPayload;
