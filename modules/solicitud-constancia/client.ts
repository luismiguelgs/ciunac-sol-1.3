'use client'

import type { RegisterSolicitudConstanciaCommand } from '@/modules/solicitud-constancia/application/commands/register-solicitud-constancia.command'
import { FindConstanciaStudentUseCase } from '@/modules/solicitud-constancia/application/use-cases/find-constancia-student.use-case'
import { GetConstanciaCargoUseCase } from '@/modules/solicitud-constancia/application/use-cases/get-constancia-cargo.use-case'
import { RegisterSolicitudConstanciaUseCase } from '@/modules/solicitud-constancia/application/use-cases/register-solicitud-constancia.use-case'
import { ConstanciaCargoApiGateway } from '@/modules/solicitud-constancia/infrastructure/api/constancia-cargo-api.gateway'
import { ConstanciaEmailGateway } from '@/modules/solicitud-constancia/infrastructure/api/constancia-email.gateway'
import { ConstanciaRequestApiGateway } from '@/modules/solicitud-constancia/infrastructure/api/constancia-request-api.gateway'
import { ConstanciaStudentApiGateway } from '@/modules/solicitud-constancia/infrastructure/api/constancia-student-api.gateway'

const studentGateway = new ConstanciaStudentApiGateway()
const registerUseCase = new RegisterSolicitudConstanciaUseCase({
  studentGateway,
  requestGateway: new ConstanciaRequestApiGateway(),
  notificationGateway: new ConstanciaEmailGateway(),
})
const findStudentUseCase = new FindConstanciaStudentUseCase(studentGateway)
const getCargoUseCase = new GetConstanciaCargoUseCase(new ConstanciaCargoApiGateway())

export function registerSolicitudConstancia(command: RegisterSolicitudConstanciaCommand) {
  return registerUseCase.execute(command)
}

export function retrySolicitudConstanciaNotification(requestId: string) {
  return registerUseCase.retryNotification(requestId)
}

export function findConstanciaStudent(documentNumber: string) {
  return findStudentUseCase.execute(documentNumber)
}

export function getConstanciaCargo(requestId: number) {
  return getCargoUseCase.execute(requestId)
}
