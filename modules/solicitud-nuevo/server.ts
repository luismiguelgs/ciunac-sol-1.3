import 'server-only'

export { getNewStudentPrograms } from '@/modules/solicitud-nuevo/infrastructure/server/q10-program.repository'
export { validateNewStudentRequest } from '@/modules/solicitud-nuevo/infrastructure/server/new-student-request-validation'
export { q10StudentRequestSchema } from '@/modules/solicitud-nuevo/infrastructure/validation/q10-api.schemas'
