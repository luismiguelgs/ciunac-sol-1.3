import { AppError } from '@/modules/shared/application/errors/app-error'
import type { CertificateCargoPort } from '@/modules/solicitud-certificado/application/ports/certificate-read.ports'
import type { CertificateCargo } from '@/modules/solicitud-certificado/domain/solicitud-certificado'

export class GetCertificateCargoUseCase {
  constructor(private readonly cargoRepository: CertificateCargoPort) {}

  async execute(requestId: number): Promise<CertificateCargo | null> {
    if (!Number.isSafeInteger(requestId) || requestId <= 0) {
      throw new AppError({
        code: 'VALIDATION',
        status: 400,
        message: 'El identificador de la solicitud no es valido.',
      })
    }
    return await this.cargoRepository.findById(requestId)
  }
}
