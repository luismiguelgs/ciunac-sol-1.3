'use client'

import type { RegisterSolicitudCertificadoCommand } from '@/modules/solicitud-certificado/application/commands/register-solicitud-certificado.command'
import { FindCertificateStudentUseCase } from '@/modules/solicitud-certificado/application/use-cases/find-certificate-student.use-case'
import { GetCertificateCargoUseCase } from '@/modules/solicitud-certificado/application/use-cases/get-certificate-cargo.use-case'
import { RegisterSolicitudCertificadoUseCase } from '@/modules/solicitud-certificado/application/use-cases/register-solicitud-certificado.use-case'
import { CertificateCargoApiGateway } from '@/modules/solicitud-certificado/infrastructure/api/certificate-cargo-api.gateway'
import { CertificateStudentApiGateway } from '@/modules/solicitud-certificado/infrastructure/api/certificate-student-api.gateway'
import { CertificadoEmailGateway } from '@/modules/solicitud-certificado/infrastructure/api/certificado-email.gateway'
import { SolicitudApiGateway } from '@/modules/solicitud-certificado/infrastructure/api/solicitud-api.gateway'

const studentGateway = new CertificateStudentApiGateway()
const registerUseCase = new RegisterSolicitudCertificadoUseCase({
  studentGateway,
  solicitudGateway: new SolicitudApiGateway(),
  notificationGateway: new CertificadoEmailGateway(),
})
const findStudentUseCase = new FindCertificateStudentUseCase(studentGateway)
const getCargoUseCase = new GetCertificateCargoUseCase(new CertificateCargoApiGateway())

export function registerSolicitudCertificado(command: RegisterSolicitudCertificadoCommand) {
  return registerUseCase.execute(command)
}

export function retrySolicitudCertificadoNotification(requestId: string) {
  return registerUseCase.retryNotification(requestId)
}

export function findCertificateStudent(documentNumber: string) {
  return findStudentUseCase.execute(documentNumber)
}

export function getCertificateCargo(requestId: number) {
  return getCargoUseCase.execute(requestId)
}
