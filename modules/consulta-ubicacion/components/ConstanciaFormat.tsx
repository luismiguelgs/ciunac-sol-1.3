import { Document, Font, Image as PdfImage, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import logoCiunac from '@/assets/logo-ciunac-trans.png'
import logoUnac from '@/assets/unac-logo.png'
import firmaDirector from '@/assets/firma_director.jpg'
import { LocationExamResult } from '@/modules/consulta-ubicacion/domain/location-consultation'

Font.register({ family: 'Roboto', src: 'https://fonts.gstatic.com/s/roboto/v16/zN7GBFwfMP4uA6AR0HCoLQ.ttf' })

const styles = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingBottom: 40,
    paddingHorizontal: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  horizontalLine: {
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    marginBottom: 10,
  },
  yearText: {
    fontSize: 11,
    textAlign: 'center',
    fontFamily: 'Roboto',
    marginBottom: 16,
  },
  constanciaTitle: {
    fontSize: 20,
    marginTop: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Roboto',
    marginBottom: 18,
  },
  bodyText: {
    fontSize: 13,
    textAlign: 'justify',
    fontFamily: 'Roboto',
    lineHeight: 1.45,
  },
  firmaContainer: {
    alignItems: 'center',
    marginTop: 42,
    marginBottom: 58,
  },
  firmaImage: {
    width: 180,
    height: 72,
  },
  firmaText: {
    fontSize: 11,
    fontFamily: 'Roboto',
    marginTop: 8,
  },
})

type Props = {
  data: LocationExamResult
  fecha: string
  ciclo: string
  yearName: string
}

export default function ConstanciaFormat({ data, fecha, ciclo, yearName }: Props) {
  const fullName = `${data.student.names} ${data.student.lastNames}`.trim().toLocaleUpperCase('es-PE')

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
        <Text style={styles.yearText}>{yearName}</Text>

        <Text style={styles.constanciaTitle}>{'CONSTANCIA DE EXAMEN DE UBICACIÓN'}</Text>

        <Text style={styles.bodyText}>
          El director del Centro de Idiomas de la Universidad Nacional del Callao, hace constar:
          {'\n\n'}
          {'Que, '}{fullName}{', identificado con documento '}{data.student.documentNumber}{', participó del examen de ubicación del idioma '}{data.language.name}{', obteniendo un puntaje de '}{data.grade}{'/100, con lo cual se le ubica en el nivel '}{ciclo}{'.'}
          {'\n\n'}
          Se expide el presente, a solicitud de la parte interesada para los fines pertinentes.
        </Text>
        <View style={styles.firmaContainer}>
          <PdfImage src={firmaDirector.src} style={styles.firmaImage} />
          <Text style={styles.firmaText}>Firma del Director</Text>
          <Text style={styles.firmaText}>{fecha}**</Text>
        </View>
        <View style={styles.horizontalLine} />
        <Text style={styles.yearText}>{'**La presente constancia tiene una validez de 90 días a partir de la fecha de rendido el examen'}</Text>
      </Page>
    </Document>
  )
}
