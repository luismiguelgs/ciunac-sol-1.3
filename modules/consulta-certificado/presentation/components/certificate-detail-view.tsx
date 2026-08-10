import Image from 'next/image'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertTriangle, Mail, Phone } from 'lucide-react'
import waterMark from '@/assets/logo-ciunac-trans.png'
import {
  CertificateDetail,
  resolveCertificateCourseLabels,
} from '@/modules/consulta-certificado/domain/certificate-detail'
import Copyright from '@/modules/shared/components/copyright'

export default function CertificateDetailView({ certificate }: { certificate: CertificateDetail }) {
  const labels = resolveCertificateCourseLabels(certificate)

  return (
    <main className="flex min-h-screen flex-col">
      <div className="container mx-auto flex-1 space-y-6 p-4">
        <h1 className="mb-8 text-center text-3xl font-bold text-primary md:text-4xl lg:text-5xl">
          Detalle de Certificado de Idiomas del CIUNAC
        </h1>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="relative overflow-hidden shadow-lg">
            <div className="absolute inset-0 flex items-center justify-center opacity-5">
              <Image
                src={waterMark}
                alt=""
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain"
              />
            </div>
            <CardHeader>
              <h2 className="relative text-center text-2xl font-bold md:text-left">
                {certificate.studentName}
              </h2>
              <Separator className="my-4" />
            </CardHeader>
            <CardContent className="relative space-y-4">
              <dl className="grid grid-cols-1 gap-3 text-sm md:text-base">
                <DetailRow label="Idioma" value={labels.language} />
                <DetailRow label="Nivel" value={certificate.level} />
                <DetailRow label="N.° de horas" value={String(certificate.hours)} />
                <DetailRow label="N.° de registro" value={certificate.registrationNumber} />
                <DetailRow label="Fecha de emisión" value={formatDate(certificate.issuedAt)} />
                <DetailRow label="Fecha de conclusión" value={formatDate(certificate.completedAt)} />
                <DetailRow label="Entregado" value={certificate.delivery.status === 'accepted' ? 'Sí' : 'No'} />
                {certificate.delivery.status === 'accepted' ? (
                  <DetailRow label="Fecha de entrega" value={formatDate(certificate.delivery.acceptedAt)} />
                ) : null}
              </dl>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <h2 className="text-center text-2xl font-bold md:text-left">NIVEL {labels.level}</h2>
              <Separator className="my-4" />
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <caption className="sr-only">Notas que forman parte del certificado</caption>
                  <TableHeader className="bg-primary">
                    <TableRow>
                      <TableHead className="font-bold text-primary-foreground">CURSO</TableHead>
                      <TableHead className="font-bold text-primary-foreground">CICLO</TableHead>
                      <TableHead className="font-bold text-primary-foreground">NOTA</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certificate.notes.map((note, index) => (
                      <TableRow
                        key={`${note.cycle}-${note.period}-${index}`}
                        className={index % 2 === 0 ? 'bg-muted/50' : ''}
                      >
                        <TableCell className="font-medium">{note.cycle}</TableCell>
                        <TableCell>{`${note.cycle} ${note.modality}`.trim()}</TableCell>
                        <TableCell>{note.grade}</TableCell>
                      </TableRow>
                    ))}
                    {certificate.notes.length === 0 ? (
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

        <Alert className="mt-8 border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <AlertDescription className="text-sm text-yellow-800">
            La información mostrada se encuentra en las bases de datos del Centro de Idiomas, pero no representa al certificado original emitido por CIUNAC.
            <div className="mt-3 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-yellow-600" aria-hidden="true" />
                <span>Correo: <span className="font-medium">ciunac.certificados@unac.edu.pe</span></span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-yellow-600" aria-hidden="true" />
                <span>Teléfono: <span className="font-medium">014291931</span></span>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </div>
      <Copyright />
    </main>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="font-semibold">{label}:</dt>
      <dd className="text-right">{value}</dd>
    </div>
  )
}

function formatDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'No disponible'
    : date.toLocaleDateString('es-PE', { timeZone: 'UTC' })
}
