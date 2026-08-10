import React from 'react'
import { Document, Image as PdfImage, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import logoCiunac from '@/assets/logo-ciunac-trans.png'
import { CertificateCargo, CertificateText } from '@/modules/solicitud-certificado/domain/solicitud-certificado'

const A4_PAGE_SIZE: [number, number] = [595.28, 841.89]

const styles = StyleSheet.create({
  page: { paddingTop: 38, paddingBottom: 38, paddingHorizontal: 52 },
  header: { alignItems: 'center', marginBottom: 16 },
  image: { width: 108, marginBottom: 8 },
  institution: { fontSize: 14, fontWeight: 'bold', textAlign: 'center' },
  center: { fontSize: 12, fontWeight: 'bold', textAlign: 'center', marginTop: 3 },
  year: { fontSize: 10, textAlign: 'center', marginTop: 8 },
  title: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginTop: 14, marginBottom: 10 },
  text: { marginVertical: 6, fontSize: 11, textAlign: 'justify', lineHeight: 1.3 },
  data: { marginVertical: 3, fontSize: 11, textAlign: 'justify', lineHeight: 1.2 },
  dataBlock: { marginTop: 6, marginBottom: 8 },
})

type Props = { texts: CertificateText[]; solicitud: CertificateCargo }

export default function CertificateCargoPdf({ texts, solicitud }: Props) {
  return (
    <Document>
      <Page size={A4_PAGE_SIZE} style={styles.page} wrap={false}>
        <View style={styles.header}>
          <PdfImage style={styles.image} src={logoCiunac.src} />
          <Text style={styles.institution}>UNIVERSIDAD NACIONAL DEL CALLAO</Text>
          <Text style={styles.center}>CENTRO DE IDIOMAS</Text>
          <Text style={styles.year}>{getText(texts, 'TEXTO_NOMBREAN')}</Text>
        </View>
        <Text style={styles.title}>CARGO PARA LA ENTREGA DE CERTIFICADOS</Text>
        <Text style={styles.text}>SE HA COMPLETADO EL PROCEDIMIENTO</Text>
        <Text style={styles.text}>{getText(texts, 'TEXTO_1_FINAL')}</Text>
        <View style={styles.dataBlock}>
          <Text style={styles.data}>{`Tipo de documento: ${upper(solicitud.typeName)}`}</Text>
          <Text style={styles.data}>{`Fecha de ingreso: ${solicitud.createdAt}`}</Text>
          <Text style={styles.data}>{`Apellidos: ${upper(solicitud.student.lastNames)}`}</Text>
          <Text style={styles.data}>{`Nombres: ${upper(solicitud.student.names)}`}</Text>
          <Text style={styles.data}>{`Documento: ${upper(solicitud.student.documentNumber)}`}</Text>
          <Text style={styles.data}>{`Idioma: ${upper(solicitud.languageName)}`}</Text>
          <Text style={styles.data}>{`Nivel: ${upper(solicitud.levelName)}`}</Text>
          <Text style={styles.data}>{`Pago: S/${solicitud.amount}`}</Text>
          <Text style={styles.data}>{`Numero de voucher: ${solicitud.voucherNumber ?? 'No aplica'}`}</Text>
          {solicitud.paidAt ? <Text style={styles.data}>{`Fecha de pago: ${solicitud.paidAt}`}</Text> : null}
        </View>
        <Text style={styles.text}>Plazo de entrega: 07 dias habiles</Text>
        <Text style={styles.text}>{getText(texts, 'TEXTO_1_DISCLAMER')}</Text>
        <Text style={styles.text}>{getText(texts, 'TEXTO_2_DISCLAMER')}</Text>
      </Page>
    </Document>
  )
}

function getText(texts: CertificateText[], code: string): string {
  return texts.find((item) => item.code === code)?.content ?? ''
}

function upper(value: string): string {
  return value.toLocaleUpperCase()
}
