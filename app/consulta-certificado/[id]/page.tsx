import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import Copyright from "@/modules/shared/components/copyright"
import Image from "next/image"
import waterMark from '@/assets/logo-ciunac-trans.png'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { Mail, Phone } from "lucide-react"
import { ICertificado, ICertificadoNota } from "@/modules/shared/interfaces/certificado.interface";
import { ciunacRequest } from '@/modules/security/server/ciunac-client';
import { readConsultationSession } from '@/modules/security/server/session';
import EmptyState from '@/modules/shared/components/empty-state'
import { certificateResponseSchema, parseExternalResponse } from '@/modules/shared/infrastructure/validation/external-response'

async function getCertificate(id:string): Promise<ICertificado | null> {
    const resData = await ciunacRequest<unknown>(`certificados/${id}`)
    if (resData === null) return null
    return parseExternalResponse(certificateResponseSchema, resData, 'La API devolvio un certificado no valido') as unknown as ICertificado
}

async function getCertificateDetail(notas:ICertificadoNota[]) {
    const sortedData = [...notas].sort((a: { ciclo: string }, b: { ciclo: string }) => {
		const aNumber = parseInt(a.ciclo.match(/\d+$/)?.[0] || '0');
  		const bNumber = parseInt(b.ciclo.match(/\d+$/)?.[0] || '0');
		return aNumber - bNumber;
	});
    return sortedData
}
type PageProps = {
    params: Promise<{
        id: string
    }>
}

export default async function GetCertificatePage({params}:PageProps) {
    const consultation = await readConsultationSession('CERTIFICADO')
    if (!consultation) redirect('/consulta-solicitud')

    const {id} = await params
    const certificado = await getCertificate(id)
    if (!certificado) {
        return (
            <main className="flex min-h-screen items-center justify-center p-4">
                <EmptyState
                    title="Certificado no disponible"
                    description="No se encontraron datos para el certificado consultado."
                    href="/consulta-solicitud"
                    actionLabel="Volver a consultar"
                />
            </main>
        )
    }
    const certificadoNotas = await getCertificateDetail(certificado?.notas ?? [])
    const cycleParts = certificadoNotas[0]?.ciclo?.split(/\s+/) ?? []
    const idioma = cycleParts[0] || certificado.idioma || 'No disponible'
    const nivel = cycleParts.slice(1).join(' ') || certificado.nivel || 'No disponible'

    return (
        <main className="min-h-screen flex flex-col">
            <div className="container mx-auto p-4 space-y-6 flex-1">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-primary mb-8">
                    Detalle de Certificado de Idiomas del CIUNAC
                </h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Certificate General Information */}
                    
                    <Card className="shadow-lg relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center opacity-5">
                            <Image
                                src={waterMark}
                                alt="CIUNAC Logo"
                                fill
                                priority
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-contain"
                            />
                        </div>
                        <CardHeader>
                            <h2 className="text-2xl font-bold text-center md:text-left relative">
                                {certificado?.estudiante}
                            </h2>
                            <Separator className="my-4" />
                        </CardHeader>
                        <CardContent className="space-y-4 relative">
                            <div className="grid grid-cols-1 gap-3 text-sm md:text-base">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold">Idioma:</span>
                                    <span>{idioma}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold">Nivel:</span>
                                    <span>{certificado?.nivel}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold">N°Horas:</span>
                                    <span>{certificado?.cantidadHoras}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold">N°Registro:</span>
                                    <span>{certificado?.numeroRegistro}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold">Fecha de Emisión:</span>
                                    <span>{formatDate(certificado.fechaEmision)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold">Fecha de Conclusión:</span>
                                    <span>{formatDate(certificado.fechaConcluido)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold">Entregado:</span>
                                    <span>{certificado?.aceptado ? 'Sí' : 'No'}</span>
                                </div>
                                {
                                    certificado?.aceptado && (
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold">Fecha de Entrega:</span>
                                            <span>{formatDate(certificado.fechaAceptacion)}</span>
                                        </div>
                                    )
                                }
                            </div>
                        </CardContent>
                    </Card>
                    
                    {/* Certificate Detailed Information */}
                    <Card className="shadow-lg">
                        <CardHeader>
                            <h2 className="text-2xl font-bold text-center md:text-left">
                                NIVEL {nivel}
                            </h2>
                            <Separator className="my-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-lg border">
                                <Table>
                                    <TableHeader className="bg-primary">
                                        <TableRow>
                                            <TableHead className="text-primary-foreground font-bold">CURSO</TableHead>
                                            <TableHead className="text-primary-foreground font-bold">CICLO</TableHead>
                                            <TableHead className="text-primary-foreground font-bold">NOTAS</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {certificadoNotas.map((item, index) => (
                                            <TableRow key={index} className={index % 2 === 0 ? 'bg-muted/50' : ''}>
                                                <TableCell className="font-medium">{item.ciclo}</TableCell>
                                                <TableCell>{`${item.ciclo} ${item.modalidad}`}</TableCell>
                                                <TableCell>{item.nota}</TableCell>
                                            </TableRow>
                                        ))}
                                        {certificadoNotas.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                                                    No hay notas disponibles para este certificado.
                                                </TableCell>
                                            </TableRow>
                                        ) : null}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <Alert className="bg-yellow-50 border-yellow-200 mt-8">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <AlertDescription className="text-sm text-yellow-800">
                        La información mostrada se encuentra en las bases de datos del centro de idiomas pero no representa al certificado original emitido por CIUNAC.
                        <div className="mt-3 flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-yellow-600" />
                                <span>
                                    Correo: <span className="font-medium">ciunac.certificados@unac.edu.pe</span>
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-yellow-600" />
                                <span>
                                    Teléfono: <span className="font-medium">014291931</span>
                                </span>
                            </div>
                        </div>
                    </AlertDescription>
                </Alert>
            </div>
            <Copyright />
        </main>
    )
}

function formatDate(value: string | undefined) {
    if (!value) return 'No disponible'
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? 'No disponible' : date.toLocaleDateString('es-PE')
}

