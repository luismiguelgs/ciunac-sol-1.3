import { Document, Font, Image as PdfImage, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import firmaDirector from '@/assets/firma_director.jpg'
import logoCiunac from '@/assets/logo-ciunac-trans.png'
import logoUnac from '@/assets/unac-logo.png'
import type { LocationCertificateDocument } from '@/modules/consulta-ubicacion/presentation/location-consultation.presenter'

Font.register({ family: 'Roboto', src: 'https://fonts.gstatic.com/s/roboto/v16/zN7GBFwfMP4uA6AR0HCoLQ.ttf' })

const styles = StyleSheet.create({
  page: { paddingTop: 30, paddingBottom: 40, paddingHorizontal: 30 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  subtitle: { fontSize: 13, marginTop: 4 },
  horizontalLine: {
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    marginBottom: 10,
  },
  yearText: { fontSize: 11, textAlign: 'center', fontFamily: 'Roboto', marginBottom: 16 },
  title: {
    fontSize: 20,
    marginTop: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Roboto',
    marginBottom: 18,
  },
  bodyText: { fontSize: 13, textAlign: 'justify', fontFamily: 'Roboto', lineHeight: 1.45 },
  signature: { alignItems: 'center', marginTop: 42, marginBottom: 58 },
  signatureImage: { width: 180, height: 72 },
  signatureText: { fontSize: 11, fontFamily: 'Roboto', marginTop: 8 },
})

export default function LocationCertificatePdf({ document }: { document: LocationCertificateDocument }) {
  return (
    <Document>
      <Page size="A4" style={styles.page} wrap={false}>
        <View style={styles.header}>
          <PdfImage src={logoUnac.src} style={{ width: 82, height: 110 }} />
          <View style={{ textAlign: 'center', fontFamily: 'Roboto', flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 17, fontWeight: 'bold' }}>UNIVERSIDAD NACIONAL DEL CALLAO</Text>
            <Text style={styles.subtitle}>RECTORADO</Text>
            <Text style={styles.subtitle}>CENTRO DE IDIOMAS</Text>
          </View>
          <PdfImage src={logoCiunac.src} style={{ width: 105, height: 105 }} />
        </View>
        <View style={styles.horizontalLine} />
        <Text style={styles.yearText}>{document.yearName}</Text>
        <Text style={styles.title}>CONSTANCIA DE EXAMEN DE UBICACIÓN</Text>
        <Text style={styles.bodyText}>
          El director del Centro de Idiomas de la Universidad Nacional del Callao, hace constar:
          {'\n\n'}
          Que, {document.fullName}, identificado con documento {document.documentNumber}, participó del examen de ubicación del idioma {document.languageName}, obteniendo un puntaje de {document.grade}/100, con lo cual se le ubica en el nivel {document.placementCycle}.
          {'\n\n'}
          Se expide el presente, a solicitud de la parte interesada para los fines pertinentes.
        </Text>
        <View style={styles.signature}>
          <PdfImage src={firmaDirector.src} style={styles.signatureImage} />
          <Text style={styles.signatureText}>Firma del Director</Text>
          <Text style={styles.signatureText}>{document.examDate}**</Text>
        </View>
        <View style={styles.horizontalLine} />
        <Text style={styles.yearText}>
          **La presente constancia tiene una validez de 90 días a partir de la fecha de rendido el examen
        </Text>
      </Page>
    </Document>
  )
}
