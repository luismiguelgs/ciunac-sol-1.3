import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppError } from '@/modules/shared/application/errors/app-error'
import { mailApiRepository } from '@/modules/shared/infrastructure/api/mail-api.repository'
import { retrySolicitudBecaNotification } from '@/modules/solicitud-beca/client'
import { registerScholarship } from '@/modules/solicitud-beca/operations'
import { solicitudBecaSchema } from '@/modules/solicitud-beca/schemas'
import {
  hasConsistentScholarshipCatalogs,
  ScholarshipCatalogs,
  SolicitudBeca,
} from '@/modules/solicitud-beca/model'
import { getScholarshipDocumentViolation } from '@/modules/solicitud-beca/domain/scholarship-document-policy'
import { toScholarshipRequestDto } from '@/modules/solicitud-beca/infrastructure/scholarship-api.mapper'
import {
  scholarshipCreateResponseSchema,
  scholarshipFacultyArraySchema,
  scholarshipRequestDtoSchema,
  scholarshipSchoolArraySchema,
} from '@/modules/solicitud-beca/infrastructure/scholarship-api.schemas'
import { toScholarshipBasicData, toScholarshipDocuments } from '@/modules/solicitud-beca/components/scholarship-form.mapper'
import type { DocumentsFormValues } from '@/modules/solicitud-beca/components/documents.schema'
import useSolicitudBecaStore from '@/modules/solicitud-beca/store'

const catalogs: ScholarshipCatalogs = {
  faculties: [{ id: 1, name: 'Ingenieria', code: 'FIIS' }],
  schools: [{ id: 2, name: 'Sistemas', facultyId: 1 }],
}

afterEach(() => vi.restoreAllMocks())

describe('scholarship notification errors', () => {
  it.each(['NETWORK', 'EXTERNAL_SERVICE', 'AUTHORIZATION'] as const)('preserves an explicit non-retryable %s error', async (code) => {
    const error = new AppError({
      code, status: 503, message: 'Correo pendiente', correlationId: 'mail-1',
      retryable: false, details: { operation: 'notification' },
    })
    vi.spyOn(mailApiRepository, 'send').mockRejectedValue(error)
    await expect(retrySolicitudBecaNotification('beca-1')).rejects.toBe(error)
    expect(mailApiRepository.send).toHaveBeenCalledExactlyOnceWith({ type: 'BECA', reference: 'beca-1' })
  })
})

describe('scholarship domain and DTO contracts', () => {
  it('accepts a complete scholarship request', () => {
    expect(solicitudBecaSchema.parse(scholarshipDraft())).toEqual(scholarshipDraft())
  })

  it.each([
    () => ({ ...scholarshipDraft(), email: 'invalid' }),
    () => ({ ...scholarshipDraft(), basicData: { ...scholarshipDraft().basicData, documentNumber: '123' } }),
    () => ({
      ...scholarshipDraft(),
      basicData: { ...scholarshipDraft().basicData, faculty: { id: 0, name: 'Invalida' } },
    }),
    () => ({
      ...scholarshipDraft(),
      documents: { ...scholarshipDraft().documents, commitmentLetterUrl: '' },
    }),
  ])('rejects incomplete or invalid scholarship data', (createCandidate) => {
    const draft = scholarshipDraft()
    expect(draft).toBeDefined()
    expect(solicitudBecaSchema.safeParse(createCandidate()).success).toBe(false)
  })

  it('maps the exact backend DTO and preserves contancia_tercio', () => {
    const dto = toScholarshipRequestDto(scholarshipDraft())
    expect(dto).toMatchObject({
      nombres: 'MARIA',
      apellidos: 'PEREZ',
      facultadId: '1',
      escuelaId: '2',
      constancia_matricula: '/files/matricula.pdf',
      contancia_tercio: '/files/tercio.pdf',
    })
    expect(Object.keys(dto).sort()).toEqual([
      'apellidos', 'carta_de_compromiso', 'codigo', 'constancia_matricula', 'contancia_tercio',
      'declaracion_jurada', 'direccion', 'email', 'escuela', 'escuelaId', 'facultad', 'facultadId',
      'historial_academico', 'nombres', 'numero_documento', 'periodo', 'telefono', 'tipo_documento',
    ].sort())
  })

  it('validates the exact scholarship payload at the BFF boundary', () => {
    const dto = toScholarshipRequestDto(scholarshipDraft())

    expect(scholarshipRequestDtoSchema.safeParse(dto).success).toBe(true)
    expect(scholarshipRequestDtoSchema.safeParse({ ...dto, carta_de_compromiso: '' }).success).toBe(false)
    expect(scholarshipRequestDtoSchema.safeParse({ ...dto, facultadId: '0' }).success).toBe(false)
  })

  it.each([{ _id: 'beca-1' }, { id: 'beca-2' }])('accepts supported scholarship identifiers', (response) => {
    expect(scholarshipCreateResponseSchema.parse(response)).toMatchObject(response)
  })

  it.each([null, {}, { _id: '' }, { id: 12 }])('rejects empty or malformed scholarship responses', (response) => {
    expect(scholarshipCreateResponseSchema.safeParse(response).success).toBe(false)
  })

  it('validates and normalizes academic catalogs', () => {
    expect(scholarshipFacultyArraySchema.parse([{ id: '1', nombre: 'Ingenieria', codigo: 'FIIS' }])[0].id).toBe(1)
    expect(scholarshipSchoolArraySchema.parse([{ id: '2', nombre: 'Sistemas', facultadId: '1' }])[0]).toMatchObject({ id: 2, facultadId: 1 })
  })

  it('detects schools associated with an unknown faculty', () => {
    expect(hasConsistentScholarshipCatalogs(catalogs)).toBe(true)
    expect(hasConsistentScholarshipCatalogs({
      ...catalogs,
      schools: [{ id: 2, name: 'Sistemas', facultyId: 99 }],
    })).toBe(false)
  })

  it('validates document metadata without depending on the browser File type', () => {
    expect(getScholarshipDocumentViolation({
      name: 'documento.pdf',
      size: 1024,
      mimeType: 'application/pdf',
    })).toBeNull()
    expect(getScholarshipDocumentViolation({
      name: 'documento.png',
      size: 1024,
      mimeType: 'application/pdf',
    })).toBe('INVALID_EXTENSION')
  })

  it.each([
    { response: [] },
    { response: [{ id: 0, nombre: 'Invalida', codigo: 'X' }] },
  ])('rejects empty or invalid faculty catalogs', ({ response }) => {
    expect(scholarshipFacultyArraySchema.safeParse(response).success).toBe(false)
  })

  it('rejects a school that does not belong to the selected faculty', () => {
    expect(() => toScholarshipBasicData(basicForm(), {
      ...catalogs,
      schools: [{ id: 2, name: 'Sistemas', facultyId: 99 }],
    })).toThrowError(AppError)
  })

  it('maps form data to domain data', () => {
    expect(toScholarshipBasicData(basicForm(), catalogs)).toMatchObject({
      documentNumber: '12345678',
      faculty: { id: 1, name: 'Ingenieria' },
      school: { id: 2, name: 'Sistemas' },
    })
    expect(toScholarshipDocuments(documentForm())).toEqual(scholarshipDraft().documents)
  })
})

describe('scholarship workflow', () => {
  beforeEach(() => useSolicitudBecaStore.getState().reset())

  it('moves through editing, registration and success', () => {
    const store = useSolicitudBecaStore.getState()
    store.initialize('user@example.com')
    store.completeBasicData(scholarshipDraft().basicData)
    store.completeDocuments(scholarshipDraft().documents)
    store.beginRegistration(scholarshipDraft())
    expect(useSolicitudBecaStore.getState().workflow).toMatchObject({ status: 'submitting', operation: 'registration' })
    useSolicitudBecaStore.getState().completeRegistration('beca-1', 'receipt-1')
    expect(useSolicitudBecaStore.getState().workflow).toMatchObject({ status: 'success', requestId: 'beca-1' })
  })

  it('keeps documents for the same document number and clears them when it changes', () => {
    const store = useSolicitudBecaStore.getState()
    store.initialize('user@example.com')
    store.completeBasicData(scholarshipDraft().basicData)
    store.completeDocuments(scholarshipDraft().documents)
    store.completeBasicData({ ...scholarshipDraft().basicData, names: 'Ana' })
    expect(useSolicitudBecaStore.getState().workflow.draft.documents).not.toBeNull()
    useSolicitudBecaStore.getState().completeBasicData({ ...scholarshipDraft().basicData, documentNumber: '87654321' })
    expect(useSolicitudBecaStore.getState().workflow.draft.documents).toBeNull()
  })

  it('represents notification failure and retry explicitly', () => {
    const store = useSolicitudBecaStore.getState()
    store.initialize('user@example.com')
    store.markNotificationFailed('beca-1', new AppError({ code: 'EXTERNAL_SERVICE', message: 'Correo pendiente' }))
    expect(useSolicitudBecaStore.getState().workflow.status).toBe('saved_notification_failed')
    useSolicitudBecaStore.getState().beginNotificationRetry('beca-1')
    expect(useSolicitudBecaStore.getState().workflow).toMatchObject({ status: 'submitting', operation: 'notification' })
  })
})

describe('scholarship registration use case', () => {
  it('returns partial success and retries only notification', async () => {
    const create = vi.fn().mockResolvedValue('beca-1')
    const sendSolicitudCreada = vi.fn()
      .mockRejectedValueOnce(new AppError({ code: 'EXTERNAL_SERVICE', message: 'Correo no disponible' }))
      .mockResolvedValueOnce('receipt-1')
    const dependencies = {
      createRequest: create,
      sendNotification: sendSolicitudCreada,
    }

    await expect(registerScholarship(scholarshipDraft(), dependencies)).resolves.toMatchObject({
      status: 'saved_notification_failed',
      requestId: 'beca-1',
    })
    vi.spyOn(mailApiRepository, 'send').mockImplementation(({ reference }) => dependencies.sendNotification(reference))
    await expect(retrySolicitudBecaNotification('beca-1')).resolves.toBe('receipt-1')
    expect(create).toHaveBeenCalledTimes(1)
    expect(sendSolicitudCreada).toHaveBeenCalledTimes(2)
  })

  it('does not call integrations for an invalid request', async () => {
    const create = vi.fn()
    const sendSolicitudCreada = vi.fn()
    const dependencies = {
      createRequest: create,
      sendNotification: sendSolicitudCreada,
    }

    await expect(registerScholarship(
      { ...scholarshipDraft(), email: 'invalid' },
      dependencies,
    )).rejects.toMatchObject({ code: 'VALIDATION' })
    expect(create).not.toHaveBeenCalled()
    expect(sendSolicitudCreada).not.toHaveBeenCalled()
  })

  it('preserves a normalized network error and stops before notification', async () => {
    const networkError = new AppError({
      code: 'NETWORK',
      status: 503,
      message: 'No se pudo conectar con el servicio',
      correlationId: 'correlation-1',
      retryable: true,
    })
    const sendNotification = vi.fn()

    await expect(registerScholarship(scholarshipDraft(), {
      createRequest: vi.fn().mockRejectedValue(networkError),
      sendNotification,
    })).rejects.toMatchObject({
      code: 'NETWORK',
      correlationId: 'correlation-1',
      retryable: true,
    })
    expect(sendNotification).not.toHaveBeenCalled()
  })
})

function basicForm() {
  return {
    apellidos: 'Perez',
    nombres: 'Maria',
    facultad: '1',
    escuela: '2',
    direccion: 'Callao',
    codigo: '20260001',
    tipo_documento: 'DNI' as const,
    celular: '999888777',
    dni: '12345678',
  }
}

function documentForm(): DocumentsFormValues {
  return {
    constancia_matricula: '/files/matricula.pdf',
    historial_academico: '/files/historial.pdf',
    constancia_tercio: '/files/tercio.pdf',
    carta_compromiso: '/files/compromiso.pdf',
    declaracion_jurada: '/files/declaracion.pdf',
  }
}

function scholarshipDraft(): SolicitudBeca {
  return {
    email: 'user@example.com',
    basicData: {
      names: 'Maria',
      lastNames: 'Perez',
      phone: '999888777',
      documentType: 'DNI',
      documentNumber: '12345678',
      address: 'Callao',
      studentCode: '20260001',
      faculty: { id: 1, name: 'Ingenieria' },
      school: { id: 2, name: 'Sistemas' },
    },
    documents: {
      enrollmentCertificateUrl: '/files/matricula.pdf',
      academicHistoryUrl: '/files/historial.pdf',
      meritCertificateUrl: '/files/tercio.pdf',
      commitmentLetterUrl: '/files/compromiso.pdf',
      swornDeclarationUrl: '/files/declaracion.pdf',
    },
  }
}
