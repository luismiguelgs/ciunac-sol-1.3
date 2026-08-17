import React from 'react'
import AdministrativeCargoPdf from '@/modules/shared/components/administrative-cargo-pdf'
import { CertificateCargo, CertificateText } from '@/modules/solicitud-certificado/domain/solicitud-certificado'

type Props = { texts: CertificateText[]; solicitud: CertificateCargo }

export default function CertificateCargoPdf({ texts, solicitud }: Props) {
  return (
    <AdministrativeCargoPdf
      document={{
        year: getText(texts, 'TEXTO_NOMBREAN'),
        title: 'CARGO PARA LA ENTREGA DE CERTIFICADOS',
        introduction: getText(texts, 'TEXTO_1_FINAL'),
        fields: cargoFields(solicitud),
        footerParagraphs: [
          'Plazo de entrega: 07 dias habiles',
          getText(texts, 'TEXTO_1_DISCLAMER'),
          getText(texts, 'TEXTO_2_DISCLAMER'),
        ],
      }}
    />
  )
}

function cargoFields(solicitud: CertificateCargo) {
  return [
    { label: 'Tipo de documento', value: upper(solicitud.typeName) },
    { label: 'Fecha de ingreso', value: solicitud.createdAt },
    { label: 'Apellidos', value: upper(solicitud.student.lastNames) },
    { label: 'Nombres', value: upper(solicitud.student.names) },
    { label: 'Documento', value: upper(solicitud.student.documentNumber) },
    { label: 'Idioma', value: upper(solicitud.languageName) },
    { label: 'Nivel', value: upper(solicitud.levelName) },
    { label: 'Pago', value: `S/${solicitud.amount}` },
    { label: 'Numero de voucher', value: solicitud.voucherNumber ?? 'No aplica' },
    ...(solicitud.paidAt ? [{ label: 'Fecha de pago', value: solicitud.paidAt }] : []),
  ]
}

function getText(texts: CertificateText[], code: string): string {
  return texts.find((item) => item.code === code)?.content ?? ''
}

function upper(value: string): string {
  return value.toLocaleUpperCase()
}
