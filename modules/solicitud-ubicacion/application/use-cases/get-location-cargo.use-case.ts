import { AppError } from '@/modules/shared/application/errors/app-error'
import type { LocationCargoPort } from '@/modules/solicitud-ubicacion/application/ports/location-read.ports'
import type { LocationCargo } from '@/modules/solicitud-ubicacion/domain/solicitud-ubicacion'

export class GetLocationCargoUseCase {
  constructor(private readonly cargoRepository: LocationCargoPort) {}

  async execute(requestId: number): Promise<LocationCargo | null> {
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
