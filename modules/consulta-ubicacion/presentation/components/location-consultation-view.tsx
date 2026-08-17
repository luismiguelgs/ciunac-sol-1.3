import { AlertTriangle, GraduationCap, User } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { LocationConsultationResult } from '@/modules/consulta-ubicacion/application/get-location-consultation.use-case'
import LocationCargoDownload from '@/modules/consulta-ubicacion/presentation/components/location-cargo-download'
import LocationCertificateDownload from '@/modules/consulta-ubicacion/presentation/components/location-certificate-download'
import {
  presentLocationConsultation,
  type LocationResultViewModel,
} from '@/modules/consulta-ubicacion/presentation/location-consultation.presenter'
import Copyright from '@/modules/shared/components/copyright'

export default function LocationConsultationView({
  consultation,
}: {
  consultation: LocationConsultationResult
}) {
  const viewModel = presentLocationConsultation(consultation)

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
              <dd>{viewModel.fullName}</dd>
            </div>
            <div className="flex flex-wrap gap-1">
              <dt className="font-semibold">Documento:</dt>
              <dd>{viewModel.documentNumber}</dd>
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
          {viewModel.results.length === 0 ? (
            <LocationEmptyState cargo={viewModel.cargo} />
          ) : (
            <div className="space-y-4">
              {!viewModel.yearAvailable ? (
                <Alert>
                  <AlertTriangle aria-hidden="true" />
                  <AlertTitle>Nombre del año no disponible</AlertTitle>
                  <AlertDescription>
                    Puede consultar sus notas, pero la constancia no estará disponible hasta recuperar el texto institucional.
                  </AlertDescription>
                </Alert>
              ) : null}
              {viewModel.results.map((result) => <LocationResult key={result.id} result={result} />)}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-auto"><Copyright /></div>
    </main>
  )
}

function LocationEmptyState({
  cargo,
}: {
  cargo: ReturnType<typeof presentLocationConsultation>['cargo']
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <div className="space-y-2">
        <p className="font-medium">Aún no se encontraron notas para este alumno.</p>
        <p className="text-sm text-muted-foreground">
          Mientras se registran las notas, puede descargar el cargo de su solicitud.
        </p>
      </div>
      {cargo.status === 'available' ? (
        <LocationCargoDownload document={cargo.document} fileName={cargo.fileName} />
      ) : (
        <Alert>
          <AlertTriangle aria-hidden="true" />
          <AlertTitle>Cargo aún no disponible</AlertTitle>
          <AlertDescription>{cargo.reason}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

function LocationResult({ result }: { result: LocationResultViewModel }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
        <div>
          <h3 className="font-medium">{result.languageName}</h3>
          <p className="text-sm text-muted-foreground">Fecha: {result.dateLabel}</p>
        </div>
        <p className="text-sm">Nota: <span className="font-bold">{result.gradeLabel}</span></p>
        <p className="text-sm">Ubicación: <span className="font-bold">{result.placementCycle}</span></p>
        {result.certificate.status === 'available' ? (
          <LocationCertificateDownload
            document={result.certificate.document}
            fileName={result.certificate.fileName}
          />
        ) : (
          <Alert>
            <AlertTriangle aria-hidden="true" />
            <AlertTitle>Constancia aún no disponible</AlertTitle>
            <AlertDescription>{result.certificate.reason}</AlertDescription>
          </Alert>
        )}
      </div>
      <Separator />
    </div>
  )
}
