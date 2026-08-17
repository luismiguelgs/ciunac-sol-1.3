import React from 'react'
import AdministrativeCargoPdf from '@/modules/shared/components/administrative-cargo-pdf'
import { LocationCargo, LocationText } from '@/modules/solicitud-ubicacion/domain/solicitud-ubicacion'

export default function LocationCargoPdf({ texts, solicitud }: { texts: LocationText[]; solicitud: LocationCargo }) {
  return (
    <AdministrativeCargoPdf
      document={{
        year: getText(texts, 'TEXTO_NOMBREAN'),
        title: 'CARGO PARA EXAMEN DE UBICACION',
        introduction: getText(texts, 'TEXTO_UBICACION_3'),
        fields: cargoFields(solicitud),
        footerParagraphs: [getText(texts, 'TEXTO_UBICACION_4')],
      }}
    />
  )
}

function cargoFields(solicitud: LocationCargo) {
  return [
    { label: 'Tipo de solicitud', value: upper(solicitud.typeName) },
    { label: 'Fecha de ingreso', value: solicitud.createdAt },
    { label: 'Apellidos', value: upper(solicitud.student.lastNames) },
    { label: 'Nombres', value: upper(solicitud.student.names) },
    { label: 'Documento', value: upper(solicitud.student.documentNumber) },
    { label: 'Idioma', value: upper(solicitud.languageName) },
    { label: 'Nivel', value: upper(solicitud.levelName) },
    { label: 'Pago', value: `S/${solicitud.amount.toFixed(2)}` },
    { label: 'Numero de voucher', value: solicitud.voucherNumber ?? 'No aplica' },
    ...(solicitud.paidAt ? [{ label: 'Fecha de pago', value: solicitud.paidAt }] : []),
  ]
}

function getText(texts: LocationText[], code: string): string {
  return texts.find((item) => item.code === code)?.content ?? ''
}

function upper(value: string): string {
  return value.toLocaleUpperCase()
}
