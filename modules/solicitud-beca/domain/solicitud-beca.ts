export type ScholarshipDocumentType = 'DNI' | 'CE' | 'PASAPORTE'

export type ScholarshipCatalogItem = {
  id: number
  name: string
}

export type ScholarshipFaculty = ScholarshipCatalogItem & {
  code: string
}

export type ScholarshipSchool = ScholarshipCatalogItem & {
  facultyId: number
}

export type ScholarshipCatalogs = {
  faculties: ScholarshipFaculty[]
  schools: ScholarshipSchool[]
}

export type ScholarshipBasicData = {
  names: string
  lastNames: string
  phone: string
  documentType: ScholarshipDocumentType
  documentNumber: string
  address: string
  studentCode: string
  faculty: ScholarshipCatalogItem
  school: ScholarshipCatalogItem
}

export type ScholarshipDocuments = {
  enrollmentCertificateUrl: string
  academicHistoryUrl: string
  meritCertificateUrl: string
  commitmentLetterUrl: string
  swornDeclarationUrl: string
}

export type SolicitudBeca = {
  email: string
  basicData: ScholarshipBasicData
  documents: ScholarshipDocuments
}
