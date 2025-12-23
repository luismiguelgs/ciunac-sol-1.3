import CertificadosService from "@/services/certificados.service"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import Copyright from "@/components/copyright"
import Image from "next/image"
import waterMark from '@/assets/logo-ciunac-trans.png'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { Mail, Phone } from "lucide-react"
import { ICertificado, ICertificadoNota } from "@/interfaces/certificado.interface";

async function getCertificate(id:string): Promise<ICertificado | undefined> {
    const resData = await CertificadosService.selectItem(id)
    return resData
}

async function getCertificateDetail(notas:ICertificadoNota[]) {
    const sortedData = notas.sort((a: { ciclo: string }, b: { ciclo: string }) => {
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
    const {id} = await params
    const certificado = await getCertificate(id)
    const certificadoNotas = await getCertificateDetail(certificado?.notas ?? [])

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
                                    <span>{certificadoNotas[0].ciclo.split(" ")[0]}</span>
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
                                    <span>{new Date(certificado?.fechaEmision ?? '').toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold">Fecha de Conclusión:</span>
                                    <span>{new Date(certificado?.fechaConcluido ?? '').toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold">Entregado:</span>
                                    <span>{certificado?.aceptado ? 'Sí' : 'No'}</span>
                                </div>
                                {
                                    certificado?.aceptado && (
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold">Fecha de Entrega:</span>
                                            <span>{new Date(certificado?.fechaAceptacion ?? '').toLocaleDateString()}</span>
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
                                NIVEL {certificadoNotas[0].ciclo.split(" ")[1]}
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