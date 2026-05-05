import { IBasicInfoSchema } from '@/modules/solicitud-certificado/schemas/basic-data.schema';
import { IFinInfoSchema } from '@/modules/shared/schemas/fin-data.schema';

export type SolicitudCertificadoStep = 'Datos básicos' | 'Datos de Pago' | 'Documentos' | 'Finalizar';

export type SolicitudCertificadoDocumentsPayload = {
  img_cert_trabajo: string;
  img_cert_estudio: string;
};

export type SolicitudCertificadoStepPayload =
  | IBasicInfoSchema
  | IFinInfoSchema
  | SolicitudCertificadoDocumentsPayload;
