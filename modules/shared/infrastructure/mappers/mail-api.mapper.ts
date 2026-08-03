import IStudent from '@/modules/solicitud-nuevo/interfaces/student.interface';
import { MailRequestDto } from '@/modules/shared/infrastructure/api/mail-api.repository';

export function toUbicacionMailRequest(email: string, codigo: string): MailRequestDto {
  void email;
  return { type: 'UBICACION', reference: codigo };
}

export function toCertificadoMailRequest(email: string, codigo: string): MailRequestDto {
  void email;
  return { type: 'CERTIFICADO', reference: codigo };
}

export function toBecaMailRequest(email: string, codigo: string): MailRequestDto {
  void email;
  return { type: 'BECA', reference: codigo };
}

export function toRegisterMailRequest(student: IStudent): MailRequestDto {
  return {
    type: 'REGISTER',
    reference: student.Numero_identificacion,
  };
}
