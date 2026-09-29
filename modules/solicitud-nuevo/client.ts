'use client'

import type { NewStudent } from './model'
import { registerStudent, retryStudentNotification } from './operations'
import { registerQ10Student, sendNewStudentNotification } from './infrastructure/new-student-client'

export function registerNewStudent({ student }: { student: NewStudent }) {
  return registerStudent(student, {
    registerStudent: registerQ10Student,
    sendNotification: sendNewStudentNotification,
  })
}

export function retryNewStudentNotification(documentNumber: string) {
  return retryStudentNotification(documentNumber, sendNewStudentNotification)
}
