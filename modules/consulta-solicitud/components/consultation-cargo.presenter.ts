import type {
  ConsultationText,
  ConsultedRequest,
} from '@/modules/consultas'
import type { AdministrativeCargoDocument } from '@/modules/shared/components/administrative-cargo-pdf'

export function toConsultationCargoDocument(
  request: ConsultedRequest,
  texts: ConsultationText[],
): AdministrativeCargoDocument {
  const isConstancia = request.requestType.kind === 'constancia'

  return {
    year: findText(texts, 'TEXTO_NOMBREAN'),
    title: isConstancia
      ? 'CARGO PARA LA ENTREGA DE CONSTANCIAS'
      : 'CARGO PARA LA ENTREGA DE CERTIFICADOS',
    introduction: findText(texts, 'TEXTO_1_FINAL'),
    fields: [
      {
        label: isConstancia ? 'Tipo de constancia' : 'Tipo de documento',
        value: upper(request.requestType.name),
      },
      { label: 'Fecha de ingreso', value: formatDate(request.createdAt) },
      { label: 'Apellidos', value: upper(request.student.lastNames) },
      { label: 'Nombres', value: upper(request.student.names) },
      { label: 'Documento', value: upper(request.student.documentNumber) },
      { label: 'Idioma', value: upper(request.language.name) },
      { label: 'Nivel', value: upper(request.level.name) },
      { label: 'Pago', value: `S/${request.payment.amount}` },
      { label: 'Numero de voucher', value: request.payment.voucherNumber ?? 'No aplica' },
      ...(request.payment.paidAt
        ? [{ label: 'Fecha de pago', value: formatDate(request.payment.paidAt) }]
        : []),
    ],
    footerParagraphs: [
      'Plazo de entrega: 07 dias habiles',
      findText(texts, 'TEXTO_1_DISCLAMER'),
      findText(texts, 'TEXTO_2_DISCLAMER'),
    ],
  }
}

function findText(texts: ConsultationText[], code: string): string {
  return texts.find((item) => item.code === code)?.content ?? ''
}

function formatDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('es-PE')
}

function upper(value: string): string {
  return value.toLocaleUpperCase()
}
