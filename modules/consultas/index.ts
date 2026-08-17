export { default as ConsultaForm } from '@/modules/consultas/presentation/components/consulta-form'
export { findConsultationText } from '@/modules/consultas/domain/consultation-text'
export type {
  ConsultationType,
  ConsultedRequest,
  ConsultedRequestKind,
  ConsultedRequestStep,
} from '@/modules/consultas/domain/consulted-request'
export type { ConsultationText } from '@/modules/consultas/domain/consultation-text'
export type { ConsultationRequestsResult } from '@/modules/consultas/application/get-consultation-requests.use-case'
