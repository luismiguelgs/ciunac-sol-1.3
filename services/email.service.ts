import IStudent from "@/modules/solicitud-nuevo/interfaces/student.interface";
import { mailApiRepository } from '@/modules/shared/infrastructure/api/mail-api.repository';
import {
    toBecaMailRequest,
    toCertificadoMailRequest,
    toRandomMailRequest,
    toRegisterMailRequest,
    toUbicacionMailRequest,
} from '@/modules/shared/infrastructure/mappers/mail-api.mapper';

export default class EmailService 
{
    public static async sendEmailUbicacion(email:string, codigo:string) {
        await this.sendEmail(toUbicacionMailRequest(email, codigo))
    }
    public static async sendEmailCertificado(email:string, codigo:string) {
        await this.sendEmail(toCertificadoMailRequest(email, codigo))
    }
    public static async sendEmailBeca(email:string, codigo:string) {
        await this.sendEmail(toBecaMailRequest(email, codigo))
    }
    public static async sendEmailRandom(email:string, random:number) {
        await this.sendEmail(toRandomMailRequest(email, random))
    }
    public static async sendEmailRegister(student:IStudent) {
        await this.sendEmail(toRegisterMailRequest(student))
        
    }
     /**
     * Returns the verification number stored in localStorage if it exists and has not expired.
     * If the number has expired, it is removed from localStorage.
     * @returns {string} The verification number if it exists and has not expired, otherwise an empty string.
     */
    public static getVerificationNumber():string {
        const storedData = sessionStorage.getItem('verificationNumber');
        if (storedData) {
            const { randomNumber, expirationTime } = JSON.parse(storedData);
            const currentTime = new Date().getTime();
            
            // verify if number has expired
            if (currentTime < expirationTime) {
                return randomNumber; // valid number
            } else {
                sessionStorage.removeItem('verificationNumber'); // Borrar el dato si ha expirado
            }
        }
        return ''; // if it does not exist or has expired
    }
    private static async sendEmail(body: Parameters<typeof mailApiRepository.send>[0]) 
    {
        try{
            await mailApiRepository.send(body)
        }catch(error){
            console.error('An error occurred while sending the email:', error);
        }
    }
}
