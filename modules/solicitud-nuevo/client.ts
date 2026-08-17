'use client'

import type { RegisterNewStudentCommand } from '@/modules/solicitud-nuevo/application/commands/register-new-student.command'
import { RegisterNewStudentUseCase } from '@/modules/solicitud-nuevo/application/use-cases/register-new-student.use-case'
import { NewStudentEmailGateway } from '@/modules/solicitud-nuevo/infrastructure/api/new-student-email.gateway'
import { Q10StudentGateway } from '@/modules/solicitud-nuevo/infrastructure/api/q10-student.gateway'

const registerUseCase = new RegisterNewStudentUseCase({
  studentGateway: new Q10StudentGateway(),
  notificationGateway: new NewStudentEmailGateway(),
})

export function registerNewStudent(command: RegisterNewStudentCommand) {
  return registerUseCase.execute(command)
}

export function retryNewStudentNotification(documentNumber: string) {
  return registerUseCase.retryNotification(documentNumber)
}
