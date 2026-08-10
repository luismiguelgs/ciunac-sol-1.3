import { AlertTriangle, GraduationCap, User } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import Download from '@/modules/consulta-ubicacion/components/download'
import {
  LocationConsultation,
  LocationExamResult,
} from '@/modules/consulta-ubicacion/domain/location-consultation'
import Copyright from '@/modules/shared/components/copyright'
import DescargaCargo from '@/modules/solicitud-ubicacion/presentation/components/descarga-cargo'

export default function LocationConsultationView({ consultation }: { consultation: LocationConsultation }) {
  const fullName = `${consultation.student.names} ${consultation.student.lastNames}`.trim().toLocaleUpperCase('es-PE')

  return (
    <main className="container mx-auto space-y-6 p-6">
      <h1 className="text-3xl font-bold text-primary">Detalle de Ubicación y Notas</h1>

      <Card className="shadow-lg">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <User className="h-6 w-6 text-primary" aria-hidden="true" />
            <h2 className="text-2xl font-semibold">Datos del Alumno</h2>
          </div>
          <Separator className="mb-4" />
          <dl className="space-y-2 p-3 text-sm md:text-base">
            <div className="flex flex-wrap gap-1">
              <dt className="font-semibold">Nombre del Alumno:</dt>
              <dd>{fullName}</dd>
            </div>
            <div className="flex flex-wrap gap-1">
              <dt className="font-semibold">Documento:</dt>
              <dd>{consultation.documentNumber}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" aria-hidden="true" />
            <h2 className="text-xl font-semibold">Notas del Alumno</h2>
          </div>
          <Separator className="my-2" />
        </CardHeader>
        <CardContent>
          {consultation.results.length === 0 ? (
            <LocationEmptyState requestId={consultation.activeRequestId} texts={consultation.cargoTexts} />
          ) : (
            <div className="space-y-4">
              {!consultation.yearName ? (
                <Alert>
                  <AlertTriangle aria-hidden="true" />
                  <AlertTitle>Nombre del año no disponible</AlertTitle>
                  <AlertDescription>
                    Puede consultar sus notas, pero la constancia no estará disponible hasta recuperar el texto institucional.
                  </AlertDescription>
                </Alert>
              ) : null}
              {consultation.results.map((result) => (
                <LocationResult key={result.id} result={result} yearName={consultation.yearName} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-auto"><Copyright /></div>
    </main>
  )
}

function LocationEmptyState({ requestId, texts }: { requestId: number; texts: LocationConsultation['cargoTexts'] }) {
  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <div className="space-y-2">
        <p className="font-medium">Aún no se encontraron notas para este alumno.</p>
        <p className="text-sm text-muted-foreground">
          Mientras se registran las notas, puede descargar el cargo de su solicitud.
        </p>
      </div>
      <DescargaCargo solicitudId={requestId} texts={texts} />
    </div>
  )
}

function LocationResult({ result, yearName }: { result: LocationExamResult; yearName: string | null }) {
  const displayDate = result.examDate ? formatDate(result.examDate) : 'No disponible'
  const placementCycle = result.placementCycle ?? 'No disponible'

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
        <div>
          <h3 className="font-medium">{result.language.name}</h3>
          <p className="text-sm text-muted-foreground">Fecha: {displayDate}</p>
        </div>
        <p className="text-sm">Nota: <span className="font-bold">{result.grade}/100</span></p>
        <p className="text-sm">Ubicación: <span className="font-bold">{placementCycle}</span></p>
        {result.completed && result.dataQuality === 'complete' && yearName ? (
          <Download item={result} fecha={displayDate} ciclo={placementCycle} yearName={yearName} />
        ) : (
          <Alert>
            <AlertTriangle aria-hidden="true" />
            <AlertTitle>Constancia aún no disponible</AlertTitle>
            <AlertDescription>
              {!result.completed
                ? 'El resultado todavía no ha sido marcado como terminado.'
                : 'Faltan datos de fecha, ciclo o año para generar una constancia completa.'}
            </AlertDescription>
          </Alert>
        )}
      </div>
      <Separator />
    </div>
  )
}

function formatDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'No disponible'
    : date.toLocaleDateString('es-PE', { timeZone: 'UTC' })
}
