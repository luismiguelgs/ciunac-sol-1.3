import Image, { StaticImageData } from 'next/image'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  CheckCircleIcon,
  Clock3,
  HourglassIcon,
  Mail,
  Phone,
  ThumbsUpIcon,
  TriangleAlert,
  XCircleIcon,
} from 'lucide-react'
import procesoUno from '@/assets/1.png'
import procesoDos from '@/assets/2.png'
import procesoTres from '@/assets/3.png'
import solicitudRechazada from '@/assets/solicitud-rechazada.png'
import { ConsultationRequestsResult } from '@/modules/consultas/application/get-consultation-requests.use-case'
import { ConsultedRequestStep } from '@/modules/consultas/domain/consulted-request'
import { findConsultationText } from '@/modules/consultas/domain/consultation-text'
import DownloadCargo from '@/modules/consulta-solicitud/presentation/components/download-cargo'
import DownloadDocumentoDigital from '@/modules/consulta-solicitud/components/download-documento-digital'

export default function ConsultationResults({ result }: { result: ConsultationRequestsResult }) {
  const student = result.requests[0].student
  const statusNotice = findConsultationText(result.texts, 'TEXTO_UBICACION_5')

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-slate-100 bg-cover bg-center bg-no-repeat dark:bg-slate-900">
      <div className="w-full max-w-md p-4 md:max-w-4xl lg:max-w-5xl">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="space-y-4 md:w-1/2">
            <h1 className="text-center text-3xl font-bold text-primary md:text-left">
              Consulta del Estado de su Solicitud
            </h1>
            <h2 className="text-center text-2xl font-bold md:text-left">
              {student.lastNames} {student.names}
            </h2>
            <p className="text-center text-muted-foreground md:text-left">
              DNI/CE/PASAPORTE: {result.documentNumber}
            </p>
            {statusNotice ? (
              <Alert>
                <AlertDescription>{renderStyledText(statusNotice)}</AlertDescription>
              </Alert>
            ) : null}
            {result.textStatus === 'unavailable' ? (
              <Alert variant="destructive">
                <TriangleAlert className="h-4 w-4" />
                <AlertTitle>Informacion complementaria no disponible</AlertTitle>
                <AlertDescription>
                  Las solicitudes se cargaron correctamente, pero algunos textos informativos no estan disponibles.
                </AlertDescription>
              </Alert>
            ) : null}
            <ContactInformation />
          </div>
          <div className="space-y-2 md:w-1/2">
            {result.requests.map((request) => {
              const statusImage = getStatusImage(request.status.step)
              const documentType = request.requestType.kind === 'constancia' ? 'constancia' : 'certificate'
              const shouldDownloadDigitalDocument = request.digital && request.status.step === 'ready'
              const cargoFallback = <DownloadCargo request={request} texts={result.texts} />

              return (
                <Card key={request.id}>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar>
                      <AvatarFallback>{getStatusIcon(request.status.step)}</AvatarFallback>
                    </Avatar>
                    <div className="flex w-full flex-col gap-1">
                      <p className="text-sm font-medium">{request.requestType.name}</p>
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-base text-muted-foreground">{formatDate(request.createdAt)}</p>
                        <p className="text-right text-sm text-muted-foreground">
                          Idioma: <span className="font-medium">{request.language.name}</span>{' '}
                          Nivel: <span className="font-medium">{request.level.name}</span>
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <div className="relative h-[300px] w-full">
                    <Image
                      src={statusImage}
                      alt={`Estado ${request.status.name}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-contain"
                    />
                  </div>
                  <CardContent>
                    {request.status.step === 'rejected' ? (
                      <Alert variant="destructive">
                        <XCircleIcon className="h-4 w-4" />
                        <AlertTitle>Motivo del rechazo</AlertTitle>
                        <AlertDescription>
                          <p className="whitespace-pre-wrap">
                            {request.observations || 'No se registro un motivo para el rechazo.'}
                          </p>
                        </AlertDescription>
                      </Alert>
                    ) : shouldDownloadDigitalDocument ? (
                      <DownloadDocumentoDigital
                        solicitudId={request.id}
                        tipoDocumento={documentType}
                        fallback={cargoFallback}
                      />
                    ) : cargoFallback}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}

function ContactInformation() {
  return (
    <Alert className="mt-4">
      <AlertDescription className="space-y-3">
        <p>
          Descargue su cargo para presentarlo junto con su documento de identidad. Si el documento es digital,
          podra descargarlo cuando la solicitud este lista.
        </p>
        <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> ciunac.certificados@unac.edu.pe</div>
        <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> 014291931</div>
        <div className="flex items-center gap-2"><Clock3 className="h-4 w-4" /> Lunes a viernes: 8:30 AM - 1:00 PM y 2:00 PM - 4:00 PM</div>
      </AlertDescription>
    </Alert>
  )
}

function renderStyledText(text: string) {
  return text.split(/(EN PROCESO|PARA RECOGER)/g).map((part, index) => (
    part === 'EN PROCESO' || part === 'PARA RECOGER'
      ? <strong key={`${part}-${index}`} className="font-bold text-blue-600">{part}</strong>
      : <span key={`${part}-${index}`}>{part}</span>
  ))
}

function getStatusImage(step: ConsultedRequestStep): StaticImageData {
  if (step === 'registered') return procesoUno
  if (step === 'ready') return procesoTres
  if (step === 'rejected') return solicitudRechazada
  return procesoDos
}

function getStatusIcon(step: ConsultedRequestStep) {
  if (step === 'registered') return <HourglassIcon className="h-4 w-4 text-blue-500" />
  if (step === 'processing') return <CheckCircleIcon className="h-4 w-4 text-green-500" />
  if (step === 'rejected') return <XCircleIcon className="h-4 w-4 text-red-600" />
  return <ThumbsUpIcon className="h-4 w-4" />
}

function formatDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Fecha no disponible' : date.toLocaleDateString('es-PE')
}
