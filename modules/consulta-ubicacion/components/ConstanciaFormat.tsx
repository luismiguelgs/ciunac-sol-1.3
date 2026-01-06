import { StyleSheet, Document, Page, View, Text, Font, Image } from '@react-pdf/renderer'
import logoCiunac from '@/assets/logo-ciunac-trans.png'
import logoUnac from '@/assets/unac-logo.png'
import firmaDirector from '@/assets/firma_director.jpg'
import { IDetalleExamenUbicacion } from '../interfaces/examen.interface';

Font.register({family:'Roboto', src:'https://fonts.gstatic.com/s/roboto/v16/zN7GBFwfMP4uA6AR0HCoLQ.ttf'})

const styles = StyleSheet.create({
    page: {
        paddingTop: 35,
    	paddingBottom: 65,
    	paddingHorizontal: 30,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 14,
        marginTop: 5,
    },
    horizontalLine: {
        borderBottomWidth: 2, // Grosor de la línea
        borderBottomColor: '#000', // Color de la línea
        borderBottomStyle: 'solid', // Estilo de la línea
        marginBottom: 10, // Espacio debajo de la línea
    },
    yearText: {
        fontSize: 12,
        textAlign: 'center',
        fontFamily: 'Roboto',
        marginBottom: 20, // Espacio debajo del texto
    },
    constanciaTitle: {
        fontSize: 22,
        marginTop: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'Roboto',
        marginBottom: 20, // Espacio debajo del título
    },
    bodyText: {
        fontSize: 14,
        textAlign: 'justify', // Texto justificado
        fontFamily: 'Roboto',
        lineHeight: 1.5, // Espaciado entre líneas
    },
    firmaContainer: {
        alignItems: 'center', // Centra la imagen horizontalmente
        marginTop: 50, // Espacio arriba de la firma
        marginBottom: 80,
    },
    firmaImage: {
        width: 200, // Ancho de la imagen de la firma
        height: 80, // Alto de la imagen de la firma
    },
    firmaText: {
        fontSize: 12,
        fontFamily: 'Roboto',
        marginTop: 10, // Espacio entre la imagen y el texto
    },
});
export default function ConstanciaFormat({data, fecha , ciclo}:{data:IDetalleExamenUbicacion | undefined, fecha:string, ciclo:string})
{
    // Datos dinámicos (pueden venir de los props)
    const nombreCompleto = data?.estudiante?.nombres + " " + data?.estudiante?.apellidos || "_________________________";
    const dni = data?.estudiante?.numeroDocumento || "_____________";
    const idioma = data?.idioma?.nombre === 'INGLES' ? 'INGLÉS' : data?.idioma?.nombre === 'PORTUGUES' ? 'PORTUGUÉS' : 'ITALIANO';
    const puntaje = data?.nota || "______";
    
    return(
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    {/* Logo izquierdo */}
                    <Image src={logoUnac.src} style={{width: 90, height: 120}} />

                    {/* Textos en el medio */}
                    <View style={{textAlign: 'center', fontFamily: 'Roboto', flex: 1, alignItems: 'center'}}>
                        <Text style={{fontSize: 18, fontWeight: 'bold'}}>UNIVERSIDAD NACIONAL DEL CALLAO</Text>
                        <Text style={styles.subtitle}>VICERRECTORADO ACADÉMICO</Text>
                        <Text style={styles.subtitle}>CENTRO DE IDIOMAS</Text>
                    </View>

                    {/* Logo derecho */}
                    <Image src={logoCiunac.src} style={{width: 120, height: 120}} />
                </View>
                {/* Línea horizontal */}
                <View style={styles.horizontalLine} />
                <Text style={styles.yearText}>&quot;Año de la unidad, la paz y el desarrollo&quot;</Text>

                {/* Título "CONSTANCIA DE EXAMEN DE UBICACIÓN" */}
                <Text style={styles.constanciaTitle}>CONSTANCIA DE EXAMEN DE UBICACIÓN</Text>

                {/* Cuerpo del texto */}
                <Text style={styles.bodyText}>
                    El director del Centro de Idiomas de la Universidad Nacional del Callao, hace constar:
                    {"\n\n"}
                    Que, {nombreCompleto.toLocaleUpperCase()}, identificado con DNI {dni}, participó del examen de ubicación del idioma {idioma}, obteniendo un puntaje de {puntaje}/100, con lo cual se le ubica en el nivel {ciclo}.
                    {"\n\n"}
                    Se expide el presente, a solicitud de la parte interesada para los fines pertinentes.
                </Text>
                {/* Firma del director */}
                <View style={styles.firmaContainer}>
                    <Image src={firmaDirector.src} style={styles.firmaImage} />
                    <Text style={styles.firmaText}>Firma del Director</Text>
                    <Text style={styles.firmaText}>{fecha}**</Text>
                </View>
                {/* Línea horizontal */}
                <View style={styles.horizontalLine} />
                <Text style={styles.yearText}>**La presente constancia tiene una validez de 90 dias a partir de la fecha de rendido el examen</Text>
            </Page>
        </Document>
    )
}