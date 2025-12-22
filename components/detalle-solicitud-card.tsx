import React from 'react'
import Link from 'next/link'
import Isolicitud from '@/interfaces/solicitud.interface'
import { Card, CardContent, CardHeader } from './ui/card'
import Image from 'next/image'
import { Separator } from './ui/separator'
import { NIVEL } from '@/lib/constants'
import useSolicitudes from '@/hooks/useSolicitudes'
import useFacultades from '@/hooks/useFacultades'
import useEscuelas from '@/hooks/useEscuelas'
import useSubjects from '@/hooks/useSubjects'
import ISolicitudBeca from '@/modules/solicitud-beca/interfaces/solicitudbeca.interface'

function detalleSolicitud(titulo:string, valor:string|undefined, link:boolean = false) {
    return (
        <div className="flex justify-between items-center">
            <span className="font-semibold">{titulo}:</span>
            {
                link ? (
                    <Link href={valor as string} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Ver documento</Link>
                ) : (<span>{valor}</span>)
            }
        </div>
    )
}

type Props = {
    solicitud: Partial<Isolicitud>
    tipo: 'BECA' | 'CERTIFICADO' | 'EXAMEN'
}

export default function DetalleSolicitudCard({solicitud, tipo}:Props) 
{
    const tiposSolicitud = useSolicitudes()
    const facultades  = useFacultades()//useStore(useFacultiesStore, (state) => state.faculties)
    const escuelas = useEscuelas()//useStore(useEscuelasStore, (state) => state.escuelas)
    const { data: idiomas } = useSubjects()//useStore(useSubjectsStore, (state) => state.subjects)

    const obtenerTipoSolicitud = ()=>{
        if(tipo=='BECA'){
            return 'SOLICITUD DE BECA'
        }else{
            return tiposSolicitud?.filter((cer)=> cer.id === Number(solicitud.tipo_solicitud))[0]?.solicitud
        }
    }
    
    if (!solicitud) {
        return <div>Loading...</div>;
    }
    return (
        <React.Fragment>
            <Card className="shadow-lg relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center opacity-5">
                        <Image
                            src='/images/logo-ciunac-trans.png'
                            alt="CIUNAC Logo"
                            fill
                            priority
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-contain"
                        />
                    </div>
                    <CardHeader>
                        <h2 className="text-2xl font-bold text-center md:text-left relative">
                            Datos de la Solicitud
                        </h2>
                        <Separator className="my-4" />
                    </CardHeader>
                    <CardContent className="space-y-2 relative">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm md:text-base">
                            {detalleSolicitud('Estado', solicitud.estado ? solicitud.estado : 'PENDIENTE')}
                            {detalleSolicitud('Tipo de Solicitud', obtenerTipoSolicitud())}
                            {detalleSolicitud('Apellidos', solicitud.apellidos?.toLocaleUpperCase())}
                            {detalleSolicitud('Nombres', solicitud.nombres?.toLocaleUpperCase())}
                            {detalleSolicitud('Celular', solicitud.celular ? solicitud.celular : (solicitud as ISolicitudBeca).telefono)}
                            {detalleSolicitud('Tipo de Documento', solicitud.tipo_documento)}
                            {detalleSolicitud('Documento', solicitud.dni ? solicitud.dni : (solicitud as ISolicitudBeca).numero_documento)}
                            {detalleSolicitud('Facultad', facultades?.filter((cer)=> cer.id === Number(solicitud.facultad))[0]?.nombre ?? '')}
                            {detalleSolicitud('Escuela', escuelas?.filter((cer)=> cer.id === Number(solicitud.escuela))[0]?.nombre ?? '')}
                            {detalleSolicitud('Código', solicitud.codigo)}
                            {detalleSolicitud('Email', solicitud.email)}
                            {detalleSolicitud('Dirección', solicitud.direccion)}
                            {
                                tipo === 'CERTIFICADO' && (
                                    <React.Fragment>
                                        {detalleSolicitud('Certificado Digital', solicitud.digital ? 'Sí' : 'No')}
                                        {detalleSolicitud('Alumno antiguo', solicitud.antiguo ? 'Sí' : 'No')}
                                        {detalleSolicitud('Idioma', idiomas?.filter((cer)=> cer.id === Number(solicitud.idioma))[0].nombre)}
                                        {detalleSolicitud('Nivel', NIVEL.find((cer)=> cer.value === solicitud.nivel)?.label)}
                                        {solicitud.img_voucher && detalleSolicitud('Monto Pagado', `S/${solicitud.pago}`)}
                                        {solicitud.img_voucher && detalleSolicitud('Fecha de Pago', solicitud.fecha_pago)}
                                        {solicitud.img_voucher && detalleSolicitud('Número de Voucher', solicitud.numero_voucher)}
                                        {solicitud.img_voucher && detalleSolicitud('Imagen de Voucher', solicitud.img_voucher, true)}
                                        {solicitud.img_cert_trabajo && detalleSolicitud('Certificado de Trabajo', solicitud.img_cert_trabajo, true)}
                                    </React.Fragment>
                                )
                            }
                            {tipo === 'EXAMEN' && (
                                <React.Fragment>
                                    {detalleSolicitud('Trabajador UNAC', solicitud.trabajador ? 'Sí' : 'No')}
                                    {detalleSolicitud('Alumno antiguo', solicitud.antiguo ? 'Sí' : 'No')}
                                    {detalleSolicitud('Idioma', solicitud.idioma)}
                                    {detalleSolicitud('Nivel', solicitud.nivel)}
                                    {solicitud.img_voucher && detalleSolicitud('Monto Pagado', `S/${solicitud.pago}`)}
                                    {solicitud.img_voucher && detalleSolicitud('Fecha de Pago', solicitud.fecha_pago)}
                                    {solicitud.img_voucher && detalleSolicitud('Número de Voucher', solicitud.numero_voucher)}
                                    {solicitud.img_voucher && detalleSolicitud('Imagen de Voucher', solicitud.img_voucher, true)}
                                    {solicitud.img_cert_trabajo && detalleSolicitud('Certificado de Trabajo', solicitud.img_cert_trabajo, true)}
                                    {solicitud.img_cert_estudio && detalleSolicitud('Certificado CIUNAC', solicitud.img_cert_estudio, true)}
                                </React.Fragment>
                            )}
                            {tipo === 'BECA' && (<React.Fragment>
                                {detalleSolicitud('Constancia de Matrícula', (solicitud as ISolicitudBeca).constancia_matricula, true)}
                                {detalleSolicitud('Historial Académico', (solicitud as ISolicitudBeca).historial_academico, true)}
                                {detalleSolicitud('Constancia de Tercio / Quinto Superior', (solicitud as ISolicitudBeca).contancia_tercio, true)}
                                {detalleSolicitud('Carta de Compromiso', (solicitud as ISolicitudBeca).carta_de_compromiso, true)}
                                {detalleSolicitud('Declaración Jurada', (solicitud as ISolicitudBeca).declaracion_jurada, true)}   
                            </React.Fragment>)}
                        </div>
                    </CardContent>
                </Card>
        </React.Fragment>
    )
}
