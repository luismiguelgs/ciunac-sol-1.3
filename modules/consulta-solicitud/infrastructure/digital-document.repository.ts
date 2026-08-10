import { AppError } from '@/modules/shared/application/errors/app-error'
import { resourceApiRepository } from '@/modules/shared/infrastructure/api/resource-api.repository'
import { parseExternalResponse } from '@/modules/shared/infrastructure/validation/external-response'
import {
  DigitalDocument,
  DigitalDocumentKind,
} from '@/modules/consulta-solicitud/domain/digital-document'
import {
  certificateDigitalDocumentResponseSchema,
  constanciaDigitalDocumentResponseSchema,
} from '@/modules/consulta-solicitud/infrastructure/validation/digital-document.schemas'

export class DigitalDocumentRepository {
  async findByRequest(kind: DigitalDocumentKind, requestId: number): Promise<DigitalDocument | null> {
    if (!Number.isInteger(requestId) || requestId <= 0) {
      throw new AppError({ code: 'VALIDATION', status: 400, message: 'La solicitud no es valida.' })
    }

    const collection = kind === 'constancia' ? 'constancias' : 'certificados'
    const response = await resourceApiRepository.getOptional<unknown>(`${collection}/solicitud/${requestId}`)
    const item = kind === 'constancia' && Array.isArray(response) ? response[0] : response
    if (item === null || item === undefined) return null

    if (kind === 'constancia') {
      const dto = parseExternalResponse(
        constanciaDigitalDocumentResponseSchema,
        item,
        'La API devolvio una constancia digital no valida.',
      )
      return {
        kind,
        id: String(dto._id ?? dto.id),
        requestId: dto.solicitudId,
        documentNumber: dto.numeroDocumento,
        descriptor: dto.tipo,
        level: dto.nivel,
        url: dto.url,
        accepted: dto.aceptado,
        issuedAt: dto.fechaEmision,
      }
    }

    const dto = parseExternalResponse(
      certificateDigitalDocumentResponseSchema,
      item,
      'La API devolvio un certificado digital no valido.',
    )
    return {
      kind,
      id: String(dto._id ?? dto.id),
      requestId: dto.solicitudId,
      documentNumber: dto.numeroDocumento,
      descriptor: dto.idioma,
      level: dto.nivel,
      url: dto.url,
      accepted: dto.aceptado,
      issuedAt: dto.fechaEmision,
    }
  }

  async accept(document: DigitalDocument): Promise<void> {
    const collection = document.kind === 'constancia' ? 'constancias' : 'certificados'
    await resourceApiRepository.updateCommand(`${collection}/${document.id}`, {
      aceptado: true,
      fechaAceptacion: new Date().toISOString(),
    })
  }
}

export const digitalDocumentRepository = new DigitalDocumentRepository()
