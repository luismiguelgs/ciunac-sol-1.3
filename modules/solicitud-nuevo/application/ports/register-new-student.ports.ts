import { NewStudent } from '@/modules/solicitud-nuevo/domain/new-student'

export interface NewStudentGateway {
  register(student: NewStudent): Promise<void>
}

export interface NewStudentNotificationGateway {
  sendRegistration(documentNumber: string): Promise<string>
}
