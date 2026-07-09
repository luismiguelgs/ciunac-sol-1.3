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

export type CargoCertificadoPdfData = {
    tipoSolicitud: string
    fechaIngreso: string
    apellidos: string
    nombres: string
    numeroDocumento: string
    idioma: string
    nivel: string
    pago: string | number
    numeroVoucher: string
    fechaPago?: string
}

type Props = {
    textos: ITexto[]
    obj: ISolicitudRes | CargoCertificadoPdfData
}

const CargoPdf: React.FC<Props> = ({ textos, obj }) => {
    const data = toCargoCertificadoPdfData(obj)

    return (
        <Document>
            <Page size={A4_PAGE_SIZE} style={styles.page}>
                <View style={styles.header}>
                    <PdfImage style={styles.image} src={logoCiunac.src} />
                    <Text style={styles.institution}>UNIVERSIDAD NACIONAL DEL CALLAO</Text>
                    <Text style={styles.center}>CENTRO DE IDIOMAS</Text>
                    <Text style={styles.year}>{message('TEXTO_NOMBREAN', textos)}</Text>
                </View>
                <Text style={styles.title}>CARGO PARA LA ENTREGA DE CERTIFICADOS</Text>
                <Text style={styles.text}>SE HA COMPLETADO EL PROCEDIMIENTO!</Text>
                <Text style={styles.text}>
                    {message('TEXTO_1_FINAL', textos)}
                </Text>
                <View style={styles.dataBlock}>
                    <Text style={styles.data}>{`Tipo de Documento: ${toUpper(data.tipoSolicitud)}`}</Text>
                    <Text style={styles.data}>{`Fecha de Ingreso: ${data.fechaIngreso}`}</Text>
                    <Text style={styles.data}>{`Apellidos: ${toUpper(data.apellidos)}`}</Text>
                    <Text style={styles.data}>{`Nombres: ${toUpper(data.nombres)}`}</Text>
                    <Text style={styles.data}>{`DNI: ${toUpper(data.numeroDocumento)}`}</Text>
                    <Text style={styles.data}>{`Idioma: ${toUpper(data.idioma)}`}</Text>
                    <Text style={styles.data}>{`Nivel: ${toUpper(data.nivel)}`}</Text>
                    <Text style={styles.data}>{`Pago: S/${data.pago}`}</Text>
                    <Text style={styles.data}>{`N\u00famero de Voucher: ${data.numeroVoucher}`}</Text>
                    {data.fechaPago ? <Text style={styles.data}>{`Fecha de Pago: ${data.fechaPago}`}</Text> : null}
                </View>
                <Text style={styles.text}>{"Plazo de entrega: 07 d\u00edas h\u00e1biles"}</Text>
                <Text style={styles.text}>
                    {message('TEXTO_1_DISCLAMER', textos)}
                </Text>
                <Text style={styles.text}>
                    {message('TEXTO_2_DISCLAMER', textos)}
                </Text>
            </Page>
        </Document>
    )
}

function toCargoCertificadoPdfData(obj: ISolicitudRes | CargoCertificadoPdfData): CargoCertificadoPdfData {
    if ('tipoSolicitud' in obj) {
        return obj
    }

    return {
        tipoSolicitud: obj.tiposSolicitud?.solicitud ?? 'SOLICITUD DE CERTIFICADO',
        fechaIngreso: obj.creadoEn ?? '',
        apellidos: obj.estudiante?.apellidos ?? '',
        nombres: obj.estudiante?.nombres ?? '',
        numeroDocumento: obj.estudiante?.numeroDocumento ?? '',
        idioma: obj.idioma?.nombre ?? '',
        nivel: obj.nivel?.nombre ?? '',
        pago: obj.pago ?? '',
        numeroVoucher: obj.numeroVoucher ?? '',
        fechaPago: obj.fechaPago,
    }
}

function message(text: string, textos: ITexto[]): string {
    const objEncontrado = textos.find(objeto => objeto.codigo === text)
    return objEncontrado ? objEncontrado.contenido : ''
}

function toUpper(value: string): string {
    return value.toLocaleUpperCase()
}

export default CargoPdf
