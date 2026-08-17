import React from 'react'
import {
  Document,
  Image as PdfImage,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer'
import logoCiunac from '@/assets/logo-ciunac-trans.png'

export const ADMINISTRATIVE_CARGO_PAGE_SIZE: [number, number] = [595.28, 841.89]

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

export type AdministrativeCargoField = {
  label: string
  value: string
}

export type AdministrativeCargoDocument = {
  year: string
  title: string
  introduction: string
  fields: AdministrativeCargoField[]
  footerParagraphs: string[]
}

export default function AdministrativeCargoPdf({ document }: { document: AdministrativeCargoDocument }) {
  return (
    <Document>
      <Page size={ADMINISTRATIVE_CARGO_PAGE_SIZE} style={styles.page} wrap={false}>
        <View style={styles.header}>
          <PdfImage style={styles.image} src={logoCiunac.src} />
          <Text style={styles.institution}>UNIVERSIDAD NACIONAL DEL CALLAO</Text>
          <Text style={styles.center}>CENTRO DE IDIOMAS</Text>
          <Text style={styles.year}>{document.year}</Text>
        </View>
        <Text style={styles.title}>{document.title}</Text>
        <Text style={styles.text}>SE HA COMPLETADO EL PROCEDIMIENTO</Text>
        <Text style={styles.text}>{document.introduction}</Text>
        <View style={styles.dataBlock}>
          {document.fields.map((field) => (
            <Text key={field.label} style={styles.data}>{`${field.label}: ${field.value}`}</Text>
          ))}
        </View>
        {document.footerParagraphs.map((paragraph, index) => (
          <Text key={`${index}-${paragraph}`} style={styles.text}>{paragraph}</Text>
        ))}
      </Page>
    </Document>
  )
}
