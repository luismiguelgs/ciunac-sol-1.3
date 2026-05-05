import { IBasicInfoSchema } from '@/modules/solicitud-beca/schemas/basic-data.schema';
import { DocumentsFormValues } from '@/modules/solicitud-beca/schemas/documents.schema';

export type SolicitudBecaStep = 'Solicitud de Beca' | 'Documentos Adjuntos' | 'Registro';
export type SolicitudBecaStepPayload = IBasicInfoSchema | DocumentsFormValues;
