import IStudent from "@/modules/solicitud-nuevo/interfaces/student.interface";
import { mailApiRepository } from '@/modules/shared/infrastructure/api/mail-api.repository';
import {
    toBecaMailRequest,
    toCertificadoMailRequest,
    toRegisterMailRequest,
    toUbicacionMailRequest,
} from '@/modules/shared/infrastructure/mappers/mail-api.mapper';

export default class EmailService 
{
    public static async sendEmailUbicacion(email:string, codigo:string) {
        return this.sendEmail(toUbicacionMailRequest(email, codigo))
    }
    public static async sendEmailCertificado(email:string, codigo:string) {
        return this.sendEmail(toCertificadoMailRequest(email, codigo))
    }
    public static async sendEmailBeca(email:string, codigo:string) {
        return this.sendEmail(toBecaMailRequest(email, codigo))
    }
    public static async sendEmailRegister(student:IStudent) {
        return this.sendEmail(toRegisterMailRequest(student))
    }
    private static async sendEmail(body: Parameters<typeof mailApiRepository.send>[0]) 
    {
        return mailApiRepository.send(body)
    }
}
