import { Document, Page, StyleSheet, Image as PdfImage, Text, View } from "@react-pdf/renderer"
import logoCiunac from '@/assets/logo-ciunac-trans.png'
import React from "react"
import { ITexto } from "@/modules/shared/interfaces/types.interface"
import { ISolicitudRes } from "@/modules/shared/interfaces/solicitud.interface"

const A4_PAGE_SIZE: [number, number] = [595.28, 841.89]

const styles = StyleSheet.create({
    page: {
        paddingTop: 38,
        paddingBottom: 38,
        paddingHorizontal: 52,
    },
    header: {
        alignItems: 'center',
        marginBottom: 16,
    },
    image: {
        width: 108,
        marginBottom: 8,
    },
    institution: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    center: {
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 3,
    },
    year: {
        fontSize: 10,
        textAlign: 'center',
        marginTop: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 14,
        marginBottom: 10,
    },
    text: {
        marginVertical: 6,
        fontSize: 11,
        textAlign: 'justify',
        lineHeight: 1.3,
    },
    data: {
        marginVertical: 3,
        fontSize: 11,
        textAlign: 'justify',
        lineHeight: 1.2,
    },
    dataBlock: {
        marginTop: 6,
        marginBottom: 8,
    },
})

type Props = {
    textos: ITexto[]
    obj: ISolicitudRes
}

const CargoPdf: React.FC<Props> = ({ textos, obj }) => (
    <Document>
        <Page size={A4_PAGE_SIZE} style={styles.page}>
            <View style={styles.header}>
                <PdfImage style={styles.image} src={logoCiunac.src} />
                <Text style={styles.institution}>UNIVERSIDAD NACIONAL DEL CALLAO</Text>
                <Text style={styles.center}>CENTRO DE IDIOMAS</Text>
                <Text style={styles.year}>{message('TEXTO_NOMBREAN', textos)}</Text>
            </View>
            <Text style={styles.title}>{"CARGO PARA EXAMEN DE UBICACI\u00d3N"}</Text>
            <Text style={styles.text}>SE HA COMPLETADO EL PROCEDIMIENTO!</Text>
            <Text style={styles.text}>
                {message('TEXTO_UBICACION_3', textos)}
            </Text>
            <View style={styles.dataBlock}>
                <Text style={styles.data}>{`Tipo de Documento: ${toUpper(obj.tiposSolicitud?.solicitud)}`}</Text>
                <Text style={styles.data}>{`Fecha de Ingreso: ${obj.creadoEn ?? ''}`}</Text>
                <Text style={styles.data}>{`Apellidos: ${toUpper(obj.estudiante?.apellidos)}`}</Text>
                <Text style={styles.data}>{`Nombres: ${toUpper(obj.estudiante?.nombres)}`}</Text>
                <Text style={styles.data}>{`DNI: ${toUpper(obj.estudiante?.numeroDocumento)}`}</Text>
                <Text style={styles.data}>{`Idioma: ${toUpper(obj.idioma?.nombre)}`}</Text>
                <Text style={styles.data}>{`Nivel: ${toUpper(obj.nivel?.nombre)}`}</Text>
                <Text style={styles.data}>{`Pago: S/${obj.pago ?? ''}`}</Text>
                <Text style={styles.data}>{`N\u00famero de Voucher: ${obj.numeroVoucher ?? ''}`}</Text>
            </View>
            <Text style={styles.text}>
                {message('TEXTO_UBICACION_4', textos)}
            </Text>
        </Page>
    </Document>
)

function message(text: string, textos: ITexto[]): string {
    const objEncontrado = textos.find(objeto => objeto.codigo === text)
    return objEncontrado ? objEncontrado.contenido : ''
}

function toUpper(value?: string): string {
    return value?.toLocaleUpperCase() ?? ''
}

export default CargoPdf
