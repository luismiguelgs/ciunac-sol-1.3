import { AppError } from '@/modules/shared/application/errors/app-error'
import type { ConstanciaCargoPort } from '@/modules/solicitud-constancia/application/ports/constancia-read.ports'
import type { ConstanciaCargo } from '@/modules/solicitud-constancia/domain/solicitud-constancia'

export class GetConstanciaCargoUseCase {
  constructor(private readonly cargoGateway: ConstanciaCargoPort) {}

  async execute(requestId: number): Promise<ConstanciaCargo | null> {
    if (!Number.isSafeInteger(requestId) || requestId <= 0) {
      throw new AppError({
        code: 'VALIDATION',
        status: 400,
        message: 'El identificador de la solicitud no es valido.',
      })
    }
    return await this.cargoGateway.findById(requestId)
  }
}
