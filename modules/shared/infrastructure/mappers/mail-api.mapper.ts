import IStudent from '@/modules/solicitud-nuevo/interfaces/student.interface';
import { MailRequestDto } from '@/modules/shared/infrastructure/api/mail-api.repository';

export function toUbicacionMailRequest(email: string, codigo: string): MailRequestDto {
  return { type: 'UBICACION', email, user: codigo };
}

export function toCertificadoMailRequest(email: string, codigo: string): MailRequestDto {
  return { type: 'CERTIFICADO', email, user: codigo };
}

export function toBecaMailRequest(email: string, codigo: string): MailRequestDto {
  return { type: 'BECA', email, user: codigo };
}

export function toRandomMailRequest(email: string, random: number): MailRequestDto {
  return { type: 'RANDOM', email, number: random };
}

export function toRegisterMailRequest(student: IStudent): MailRequestDto {
  return {
    type: 'REGISTER',
    email: student.Email,
    user: student.Numero_identificacion,
  };
}
