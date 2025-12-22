import { Document, Page, StyleSheet, Image, Text } from "@react-pdf/renderer"
import logoCiunac from '@/assets/logo-ciunac-trans.png'
import React from "react"
import { ITexto } from "@/interfaces/types.interface"

const styles = StyleSheet.create({
    page: {
        paddingTop: 35,
        paddingBottom: 35,
        paddingHorizontal: 45
    },
    image: {
        marginBottom: 30,
        marginHorizontal: 10,
        width: 110,
    },
    title: {
        fontSize: 22,
        textAlign: 'center',
        marginBottom: 10
    },
    text: {
        margin: 10,
        fontSize: 12,
        textAlign: 'justify',
    },
    data: {
        marginHorizontal: 12,
        marginVertical: 5,
        fontSize: 13,
        textAlign: 'justify'
    }
})

type Props = {
    textos: ITexto[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    obj: any
}
const CargoPdf: React.FC<Props> = ({ textos, obj }) => (
    <Document>
        <Page size='A4' style={styles.page}>
            <Image style={styles.image} src={logoCiunac.src} />
            <Text style={styles.title}>CARGO PARA LA ENTREGA DE CERTIFICADOS</Text>
            <Text style={styles.text}>SE HA COMPLETADO EL PROCEDIMIENTO!</Text>
            <Text style={styles.text}>
                {message('TEXTO_1_FINAL', textos)}
            </Text>
            <Text style={styles.data}>{`Tipo de Documento: ${obj.tiposSolicitud.solicitud.toLocaleUpperCase()}`}</Text>
            <Text style={styles.data}>{`Fecha de Ingreso: ${obj.creadoEn}`}</Text>
            <Text style={styles.data}>{`Apellidos: ${obj.estudiante.apellidos.toLocaleUpperCase()}`}</Text>
            <Text style={styles.data}>{`Nombres: ${obj.estudiante.nombres.toLocaleUpperCase()}`}</Text>
            <Text style={styles.data}>{`DNI: ${obj.estudiante.numeroDocumento.toLocaleUpperCase()}`}</Text>
            <Text style={styles.data}>{`Idioma: ${obj.idioma.nombre.toLocaleUpperCase()}`}</Text>
            <Text style={styles.data}>{`Nivel: ${obj.nivel.nombre.toLocaleUpperCase()}`}</Text>
            <Text style={styles.data}>{`Pago: S/${obj.pago}`}</Text>
            <Text style={styles.data}>{`Número de Voucher: ${obj.numeroVoucher}`}</Text>
            <Text style={styles.data}>{`Fecha de Pago: ${obj.fechaPago}`}</Text>
            <Text style={styles.text}>Plazo de entrega: 10 dias hábiles</Text>
            <Text style={styles.text}>
                {message('TEXTO_1_DISCLAMER', textos)}
            </Text>
            <Text style={styles.text}>
                {message('TEXTO_2_DISCLAMER', textos)}
            </Text>
        </Page>
    </Document>
)

function message(text: string, textos: ITexto[]): string {
    const objEncontrado = textos.find(objeto => objeto.codigo === text)
    return objEncontrado ? objEncontrado.contenido : '';
}

export default CargoPdf