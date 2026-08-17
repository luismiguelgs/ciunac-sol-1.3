import 'server-only'

export { locationProfileCommandSchema } from '@/modules/solicitud-ubicacion/application/validation/solicitud-ubicacion.schema'
export {
  getLocationCatalogs,
  getLocationEntryData,
  getLocationTexts,
} from '@/modules/solicitud-ubicacion/infrastructure/server/location-catalog.repository'
export {
  readLocationProfile,
  writeLocationProfile,
} from '@/modules/solicitud-ubicacion/infrastructure/server/location-profile-session'
export {
  validateLocationRequest,
  validateLocationStudentRequest,
} from '@/modules/solicitud-ubicacion/infrastructure/server/location-request-validation'
export {
  validateIdentityDocumentUpload,
  validateLocationStudyCertificateUpload,
} from '@/modules/solicitud-ubicacion/infrastructure/validation/location-document-upload'
export { locationCreateCommandDtoSchema } from '@/modules/solicitud-ubicacion/infrastructure/validation/location-api.schemas'
