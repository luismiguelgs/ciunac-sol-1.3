import React from 'react'
import { Document, Image as PdfImage, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import logoCiunac from '@/assets/logo-ciunac-trans.png'
import { ISolicitudRes } from '@/modules/shared/interfaces/solicitud.interface'
import { ITexto } from '@/modules/shared/interfaces/types.interface'

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

type Props = {
  textos: ITexto[]
  solicitud: ISolicitudRes
}

export default function ConstanciaCargoPdf({ textos, solicitud }: Props) {
  return (
    <Document>
      <Page size={A4_PAGE_SIZE} style={styles.page} wrap={false}>
        <View style={styles.header}>
          <PdfImage style={styles.image} src={logoCiunac.src} />
          <Text style={styles.institution}>UNIVERSIDAD NACIONAL DEL CALLAO</Text>
          <Text style={styles.center}>CENTRO DE IDIOMAS</Text>
          <Text style={styles.year}>{getText(textos, 'TEXTO_NOMBREAN')}</Text>
        </View>
        <Text style={styles.title}>CARGO PARA LA ENTREGA DE CONSTANCIAS</Text>
        <Text style={styles.text}>SE HA COMPLETADO EL PROCEDIMIENTO</Text>
        <Text style={styles.text}>{getText(textos, 'TEXTO_1_FINAL')}</Text>
        <View style={styles.dataBlock}>
          <Text style={styles.data}>{`Tipo de constancia: ${upper(solicitud.tiposSolicitud?.solicitud)}`}</Text>
          <Text style={styles.data}>{`Fecha de ingreso: ${solicitud.creadoEn ?? ''}`}</Text>
          <Text style={styles.data}>{`Apellidos: ${upper(solicitud.estudiante?.apellidos)}`}</Text>
          <Text style={styles.data}>{`Nombres: ${upper(solicitud.estudiante?.nombres)}`}</Text>
          <Text style={styles.data}>{`Documento: ${upper(solicitud.estudiante?.numeroDocumento)}`}</Text>
          <Text style={styles.data}>{`Idioma: ${upper(solicitud.idioma?.nombre)}`}</Text>
          <Text style={styles.data}>{`Nivel: ${upper(solicitud.nivel?.nombre)}`}</Text>
          <Text style={styles.data}>{`Pago: S/${solicitud.pago ?? ''}`}</Text>
          <Text style={styles.data}>{`Numero de voucher: ${solicitud.numeroVoucher ?? 'No aplica'}`}</Text>
          {solicitud.fechaPago ? <Text style={styles.data}>{`Fecha de pago: ${solicitud.fechaPago}`}</Text> : null}
        </View>
        <Text style={styles.text}>Plazo de entrega: 07 dias habiles</Text>
        <Text style={styles.text}>{getText(textos, 'TEXTO_1_DISCLAMER')}</Text>
        <Text style={styles.text}>{getText(textos, 'TEXTO_2_DISCLAMER')}</Text>
      </Page>
    </Document>
  )
}

function getText(textos: ITexto[], code: string) {
  return textos.find((item) => item.codigo === code)?.contenido ?? ''
}

function upper(value: string | undefined) {
  return value?.toLocaleUpperCase() ?? ''
}
