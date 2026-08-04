import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { HourglassIcon, CheckCircleIcon, ThumbsUpIcon, XCircleIcon } from "lucide-react"
import Image from "next/image"
import procesoUno from "@/assets/1.png"
import procesoDos from "@/assets/2.png"
import procesoTres from "@/assets/3.png"
import solicitudRechazada from "@/assets/solicitud-rechazada.png"
import DownloadCargo from "@/modules/consulta-solicitud/components/donwload-cargo";
import { ISolicitudRes } from "@/modules/shared/interfaces/solicitud.interface";
import DownloadDocumentoDigital from "@/modules/consulta-solicitud/components/download-documento-digital";
import { ITexto } from '@/modules/shared/interfaces/types.interface';
import { ciunacRequest } from '@/modules/security/server/ciunac-client';
import { readConsultationSession } from '@/modules/security/server/session';
import EmptyState from '@/modules/shared/components/empty-state';
import { externalRecordArraySchema, parseExternalResponse } from '@/modules/shared/infrastructure/validation/external-response';

async function getRequests(dni:string): Promise<ISolicitudRes[]> {
    const res = await ciunacRequest<unknown>(`solicitudes/documento/${dni}`);
    if (res === null) return [];
    return parseExternalResponse(externalRecordArraySchema, res, 'La API devolvio solicitudes no validas') as unknown as ISolicitudRes[];
}
async function getTextos(): Promise<ITexto[]> {
    try {
        const res = await ciunacRequest<unknown>('textos');
        if (res === null) return [];
        return parseExternalResponse(externalRecordArraySchema, res, 'La API devolvio textos no validos') as unknown as ITexto[];
    } catch {
        return [];
    }
}

// Add this type definition
type PageProps = {
    params: Promise<{
        dni: string
    }>
}

// Helper function (puede ir dentro o fuera del componente principal)
const renderStyledText = (text: string | undefined) => {
    if (!text) return null;
    const parts = text.split(/(EN PROCESO|PARA RECOGER)/g);
    return parts.map((part, index) => {
        if (part === 'EN PROCESO' || part === 'PARA RECOGER') {
            return <strong key={index} className="font-bold text-blue-600">{part}</strong>;
        }
        return <span key={index}>{part}</span>;
    });
};

type SolicitudStatusStep = 'iniciado' | 'proceso' | 'recoger' | 'rechazado';

function getSolicitudStatusStep(item: ISolicitudRes): SolicitudStatusStep {
    const estadoNombre = item.estado?.nombre?.trim().toUpperCase();

    if (item.estadoId === 5 || estadoNombre === 'RECHAZADO') {
        return 'rechazado';
    }

    if (item.estadoId === 1 || estadoNombre === 'NUEVO') {
        return 'iniciado';
    }

    if (item.estadoId === 3 || estadoNombre === 'PARA RECOGER' || estadoNombre === 'ENTREGADO') {
        return 'recoger';
    }

    if (item.estadoId === 2 || item.estadoId === 4 || estadoNombre === 'ASIGNADO' || estadoNombre === 'PAGADO') {
        return 'proceso';
    }

    return 'proceso';
}

function getSolicitudStatusImage(step: SolicitudStatusStep) {
    if (step === 'iniciado') return procesoUno;
    if (step === 'recoger') return procesoTres;
    if (step === 'rechazado') return solicitudRechazada;
    return procesoDos;
}

function isConstancia(item: ISolicitudRes) {
    return [5, 6].includes(Number(item.tipoSolicitudId));
}

export default async function ResultadoSolicitudPage({ params }: PageProps) {
    const { dni } = await params;
    const consultation = await readConsultationSession('CERTIFICADO', dni);
    if (!consultation) redirect('/consulta-solicitud');
    const requests = await getRequests(dni);
    const textos = await getTextos();

    if (requests.length === 0) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
                <EmptyState
                    title="No se encontraron solicitudes"
                    description="No existen solicitudes disponibles para el documento consultado."
                    href="/consulta-solicitud"
                    actionLabel="Realizar otra consulta"
                />
            </main>
        );
    }

    return (
        <main className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex items-center justify-center bg-slate-100 dark:bg-slate-900">
            <div className="w-full max-w-md p-4 md:max-w-4xl lg:max-w-5xl">
                {requests && requests.length > 0 && (
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="md:w-1/2 space-y-4">
                            <h1 className="text-3xl font-bold text-center md:text-left text-primary">
                                Consulta del Estado de su Solicitud
                            </h1>
                            <h2 className="text-2xl font-bold text-center md:text-left">
                                {`${requests[0].estudiante?.apellidos} ${requests[0].estudiante?.nombres}`}
                            </h2>
                            <p className="text-muted-foreground text-center md:text-left">DNI/CE/PASAPORTE: {dni}</p>
                            {textos && (
                                <Alert>
                                    <AlertDescription>
                                        {/* Usa la función auxiliar aquí */}
                                        {renderStyledText(textos.find(objeto => objeto.codigo === 'TEXTO_UBICACION_5')?.contenido)}
                                    </AlertDescription>
                                </Alert>
                            )}
                            <Alert className="mt-4">
                                <AlertDescription>
                                    Haga clic en el icono PDF o el botón para descargar su cargo. Presente este cargo junto con su DNI en la oficina.
                                    En caso sea certificado digital, puede descargarlo desde el link proporcionado.
                                    <br/><br/>
                                    Para consultas:<br/>
                                    📧 ciunac.certificados@unac.edu.pe<br/>
                                    📞 014291931<br/>
                                    ⏰ Lunes a Viernes: 8:30 AM - 1:00 PM y 2:00 PM - 4:00 PM
                                </AlertDescription>
                            </Alert>
                        </div>
                        <div className="md:w-1/2 space-y-2">
                            {requests.map((item) => {
                                const statusStep = getSolicitudStatusStep(item);
                                const statusImage = getSolicitudStatusImage(statusStep);
                                const tipoDocumento = isConstancia(item) ? 'constancia' : 'certificado';
                                const shouldDownloadDigitalDocument = item.digital && statusStep === 'recoger';
                                const cargoFallback = <DownloadCargo item={item} textos={textos} />;

                                return (
                                <Card key={item.id}>
                                    <CardHeader className="flex flex-row items-center gap-4">
                                        <Avatar>
                                            <AvatarFallback>
                                                {statusStep === 'iniciado' ? (
                                                    <HourglassIcon className="h-4 w-4 text-blue-500" />
                                                ) : statusStep === 'proceso' ? (
                                                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                                ) : statusStep === 'rechazado' ? (
                                                    <XCircleIcon className="h-4 w-4 text-red-600" />
                                                ) : (
                                                    <ThumbsUpIcon className="h-4 w-4" />
                                                )}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col w-full gap-1">
                                            <p className="text-sm font-medium">{item.tiposSolicitud?.solicitud}</p>
                                            <div className="flex items-center justify-between">
                                                <p className="text-base text-muted-foreground">
                                                    {item.creadoEn? new Date(item.creadoEn as string).toLocaleDateString('es-ES'): ''}
                                                </p>
                                                <p className="text-md text-muted-foreground">
                                                    Idioma: <span className="font-medium">{ item.idioma?.nombre }</span>{' '}
                                                    Nivel: <span className="font-medium">{item.nivel?.nombre}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <div className="relative h-[300px] w-full">
                                        <Image
                                            src={statusImage}
                                            alt="Estado de la solicitud"
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            className="object-contain"
                                        />
                                    </div>
                                    <CardContent>
                                        {statusStep === 'rechazado' ? (
                                            <Alert variant="destructive">
                                                <XCircleIcon />
                                                <AlertTitle>Motivo del rechazo</AlertTitle>
                                                <AlertDescription>
                                                    <p className="whitespace-pre-wrap">
                                                        {item.observaciones?.trim() || 'No se registró un motivo para el rechazo.'}
                                                    </p>
                                                </AlertDescription>
                                            </Alert>
                                        ) : textos && shouldDownloadDigitalDocument ? (
                                                <DownloadDocumentoDigital
                                                    solicitudId={item.id as number}
                                                    tipoDocumento={tipoDocumento}
                                                    fallback={cargoFallback}
                                                />
                                            ) : (
                                                cargoFallback
                                            )}
                                    </CardContent>
                                </Card>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </main>
    )
}

