import type { LocationConsultationResult } from '@/modules/consulta-ubicacion/application/get-location-consultation.use-case'
import type { AdministrativeCargoDocument } from '@/modules/shared/components/administrative-cargo-pdf'

const REQUIRED_CARGO_TEXTS = ['TEXTO_NOMBREAN', 'TEXTO_UBICACION_3', 'TEXTO_UBICACION_4'] as const

export type LocationCertificateDocument = {
  fullName: string
  documentNumber: string
  languageName: string
  grade: number
  placementCycle: string
  examDate: string
  yearName: string
}

export type LocationResultViewModel = {
  id: number
  languageName: string
  dateLabel: string
  gradeLabel: string
  placementCycle: string
  certificate:
    | { status: 'available'; document: LocationCertificateDocument; fileName: string }
    | { status: 'unavailable'; reason: string }
}

export type LocationConsultationViewModel = {
  fullName: string
  documentNumber: string
  yearAvailable: boolean
  results: LocationResultViewModel[]
  cargo:
    | { status: 'available'; document: AdministrativeCargoDocument; fileName: string }
    | { status: 'unavailable'; reason: string }
}

export function presentLocationConsultation(
  consultation: LocationConsultationResult,
): LocationConsultationViewModel {
  const fullName = upper(`${consultation.student.names} ${consultation.student.lastNames}`.trim())

  return {
    fullName,
    documentNumber: consultation.documentNumber,
    yearAvailable: Boolean(consultation.yearName),
    results: consultation.results.map((result) => {
      const dateLabel = formatDate(result.examDate)
      const placementCycle = result.placementCycle ?? 'No disponible'

      return {
        id: result.id,
        languageName: result.language.name,
        dateLabel,
        gradeLabel: `${result.grade}/100`,
        placementCycle,
        certificate: result.certificateAvailable && consultation.yearName && result.examDate && result.placementCycle
          ? {
              status: 'available' as const,
              document: {
                fullName: upper(`${result.student.names} ${result.student.lastNames}`.trim()),
                documentNumber: result.student.documentNumber,
                languageName: result.language.name,
                grade: result.grade,
                placementCycle: result.placementCycle,
                examDate: dateLabel,
                yearName: consultation.yearName,
              },
              fileName: certificateFileName(
                result.student.documentNumber,
                result.language.name,
                result.evaluatedLevel.name,
              ),
            }
          : {
              status: 'unavailable' as const,
              reason: !result.completed
                ? 'El resultado todavía no ha sido marcado como terminado.'
                : 'Faltan datos de fecha, ciclo o año para generar una constancia completa.',
            },
      }
    }),
    cargo: presentCargo(consultation),
  }
}

function presentCargo(
  consultation: LocationConsultationResult,
): LocationConsultationViewModel['cargo'] {
  const textByCode = new Map(consultation.cargoTexts.map((text) => [text.code, text.content.trim()]))
  const missingText = REQUIRED_CARGO_TEXTS.some((code) => !textByCode.get(code))

  if (consultation.textStatus === 'unavailable' || missingText) {
    return {
      status: 'unavailable',
      reason: 'Los textos institucionales necesarios para generar el cargo no están disponibles.',
    }
  }

  const cargo = consultation.cargo
  const fields = [
    { label: 'Tipo de solicitud', value: upper(cargo.requestTypeName) },
    { label: 'Fecha de ingreso', value: cargo.createdAt },
    { label: 'Apellidos', value: upper(cargo.student.lastNames) },
    { label: 'Nombres', value: upper(cargo.student.names) },
    { label: 'Documento', value: upper(cargo.student.documentNumber) },
    { label: 'Idioma', value: upper(cargo.languageName) },
    { label: 'Nivel', value: upper(cargo.levelName) },
    { label: 'Pago', value: `S/${cargo.amount.toFixed(2)}` },
    { label: 'Número de voucher', value: cargo.voucherNumber ?? 'No aplica' },
    ...(cargo.paidAt ? [{ label: 'Fecha de pago', value: cargo.paidAt }] : []),
  ]

  return {
    status: 'available',
    document: {
      year: textByCode.get('TEXTO_NOMBREAN') ?? '',
      title: 'CARGO PARA EXAMEN DE UBICACIÓN',
      introduction: textByCode.get('TEXTO_UBICACION_3') ?? '',
      fields,
      footerParagraphs: [textByCode.get('TEXTO_UBICACION_4') ?? ''],
    },
    fileName: `UBICACION-${safeFilePart(cargo.student.documentNumber)}-${cargo.requestId}.pdf`,
  }
}

function certificateFileName(documentNumber: string, language: string, level: string): string {
  return `${[documentNumber, language, level].map(safeFilePart).join('-')}.pdf`
}

function safeFilePart(value: string): string {
  return value.replace(/[^A-Za-z0-9_-]+/g, '-')
}

function formatDate(value: string | null): string {
  if (!value) return 'No disponible'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'No disponible'
    : date.toLocaleDateString('es-PE', { timeZone: 'UTC' })
}

function upper(value: string): string {
  return value.toLocaleUpperCase('es-PE')
}
