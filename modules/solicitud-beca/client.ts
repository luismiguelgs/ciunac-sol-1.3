'use client'

import type { RegisterSolicitudBecaCommand } from '@/modules/solicitud-beca/application/commands/register-solicitud-beca.command'
import { RegisterSolicitudBecaUseCase } from '@/modules/solicitud-beca/application/use-cases/register-solicitud-beca.use-case'
import { BecaEmailGateway } from '@/modules/solicitud-beca/infrastructure/api/beca-email.gateway'
import { SolicitudBecaApiGateway } from '@/modules/solicitud-beca/infrastructure/api/solicitud-beca-api.gateway'

const registerSolicitudBecaUseCase = new RegisterSolicitudBecaUseCase({
  solicitudGateway: new SolicitudBecaApiGateway(),
  notificationGateway: new BecaEmailGateway(),
})

export function registerSolicitudBeca(command: RegisterSolicitudBecaCommand) {
  return registerSolicitudBecaUseCase.execute(command)
}

export function retrySolicitudBecaNotification(requestId: string) {
  return registerSolicitudBecaUseCase.retryNotification(requestId)
}
