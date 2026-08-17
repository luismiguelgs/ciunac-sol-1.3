'use client'

import type { RegisterSolicitudUbicacionCommand } from '@/modules/solicitud-ubicacion/application/commands/register-solicitud-ubicacion.command'
import { CheckDuplicateSolicitudUbicacionUseCase } from '@/modules/solicitud-ubicacion/application/use-cases/check-duplicate-solicitud-ubicacion.use-case'
import { FindLocationStudentUseCase } from '@/modules/solicitud-ubicacion/application/use-cases/find-location-student.use-case'
import { GetLocationCargoUseCase } from '@/modules/solicitud-ubicacion/application/use-cases/get-location-cargo.use-case'
import { RegisterSolicitudUbicacionUseCase } from '@/modules/solicitud-ubicacion/application/use-cases/register-solicitud-ubicacion.use-case'
import { LocationCargoApiGateway } from '@/modules/solicitud-ubicacion/infrastructure/api/location-cargo-api.gateway'
import { saveLocationProfile as saveProfile } from '@/modules/solicitud-ubicacion/infrastructure/api/location-profile.client'
import { LocationStudentApiGateway } from '@/modules/solicitud-ubicacion/infrastructure/api/location-student-api.gateway'
import { SolicitudUbicacionApiGateway } from '@/modules/solicitud-ubicacion/infrastructure/api/solicitud-ubicacion-api.gateway'
import { UbicacionEmailGateway } from '@/modules/solicitud-ubicacion/infrastructure/api/ubicacion-email.gateway'

const studentGateway = new LocationStudentApiGateway()
const requestGateway = new SolicitudUbicacionApiGateway()
const registerUseCase = new RegisterSolicitudUbicacionUseCase({
  studentGateway,
  solicitudGateway: requestGateway,
  notificationGateway: new UbicacionEmailGateway(),
})
const duplicateUseCase = new CheckDuplicateSolicitudUbicacionUseCase(requestGateway)
const findStudentUseCase = new FindLocationStudentUseCase(studentGateway)
const getCargoUseCase = new GetLocationCargoUseCase(new LocationCargoApiGateway())

export function saveLocationProfile(isCiunacStudent: boolean) {
  return saveProfile(isCiunacStudent)
}

export function registerSolicitudUbicacion(command: RegisterSolicitudUbicacionCommand) {
  return registerUseCase.execute(command)
}

export function retrySolicitudUbicacionNotification(requestId: string) {
  return registerUseCase.retryNotification(requestId)
}

export function checkDuplicateSolicitudUbicacion(input: { documentNumber: string; languageId: number }) {
  return duplicateUseCase.execute(input)
}

export function findLocationStudent(documentNumber: string) {
  return findStudentUseCase.execute(documentNumber)
}

export function getLocationCargo(requestId: number) {
  return getCargoUseCase.execute(requestId)
}
