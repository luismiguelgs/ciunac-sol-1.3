import React from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import Image from "next/image"
import ReCAPTCHA from "react-google-recaptcha"
import { Form } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { initialValues, IVerificationSchema, verificationSchema } from "../schemas/verificacion.schema"
import { StepperControl } from "@/components/stepper"
import { toast } from "sonner"
import MyAlert from "@/components/forms/myAlert"
import MyInputOpt from "@/components/forms/input.otp"
import InputField from "@/components/forms/input.field"
import EmailService from "@/services/email.service"

type Props = {
    activeStep: number;
    steps: string[];
    setActiveStep: React.Dispatch<React.SetStateAction<number>>; 
    handleNext: (data: IVerificationSchema) => void;
}

export default function Verification({activeStep, steps, setActiveStep, handleNext}: Props) 
{
    const [disabled, setDisabled] = React.useState<boolean>(false);
    const [timeLeft, setTimeLeft] = React.useState<number | null>(null);

    const captchaRef = React.useRef<ReCAPTCHA>(null)

    const form = useForm({
        resolver: zodResolver(verificationSchema),
        defaultValues: initialValues,
    })

    const onSubmit = async (data: IVerificationSchema) => {
        if(!captchaRef.current?.getValue()){
            toast.warning('Advertencia',{description: 'Por favor, confirme que no eres un robot'})
           
        }else{
            const verificationNumber = String(getVerificationNumber()).trim();
            
            if(verificationNumber === data.code){
                handleNext(data)
            }
            else{
                toast.warning('Advertencia',{description: 'El código de verificación es incorrecto'})
            }
        }
    }
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    React.useEffect(() => {
        if (timeLeft !== null && timeLeft > 0) {
            const intervalId = setInterval(() => {
                setTimeLeft(prev => prev! - 1);
            }, 1000);

            return () => clearInterval(intervalId); // Clean interval
        }

        if (timeLeft === 0) {
            setDisabled(false); // Enabled after 5 minutes
            setTimeLeft(null); // Stop Timer
        }
    },[timeLeft])

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-4">
                <h2 className="text-2xl font-bold uppercase text-center mb-6">
                    Verificación de correo electrónico
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="flex flex-col items-center space-y-4">
                        <Image 
                            src="/images/email-verification.png" 
                            alt="logo" 
                            width={190} 
                            height={190} 
                        />
                        <MyAlert 
                            title="Comprobar tu correo electrónico:"
                            description={<>
                                    Ingresa tu correo electrónico y luego haz click en <strong>COMPROBAR</strong>{' '}
                                    Se te enviará un correo electrónico con un código de verificación.{' '}
                                    El código deberá ser ingresado en la caja de texto <strong>Código de verificación</strong>{' '}
                                    En caso no veas el código en tu bandeja principal, puedes verificar en correos no deseados (SPAM).
                                </>}
                        />
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6 pt-3">
                        <InputField
                            control={form.control}
                            name='email'
                            type="email"
                            disabled={disabled}
                        />
                        <div className="flex flex-col items-center space-y-4">
                            <Button 
                                disabled={disabled}
                                onClick={verifyEmail}
                                type="button"
                                className="w-full md:w-auto"
                            >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Comprobar
                            </Button>

                            <MyInputOpt 
                                name="code"
                                label="Código de verificación"
                                control={form.control}
                                disabled={disabled}
                                description="Ingresa el código de verificación de 4 dígitos"
                            />
                        </div>

                        {timeLeft !== null && (
                            <p className="text-xl text-center mt-4">
                               Tiempo restante: {formatTime(timeLeft)}
                            </p>
                        )}

                        <div className="flex justify-center p-6">
                            <ReCAPTCHA 
                                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY as string} 
                                ref={captchaRef} 
                            />
                        </div>
                    </div>
                </div>
                 {/* Botones de navegación */}
                <StepperControl 
                    activeStep={activeStep} 
                    steps={steps} 
                    setActiveStep={setActiveStep}
                    type="submit"
                />
            </form>
        </Form>
    )
    /**
     * Sends an email verification to the user with a random number.
     * Stores the random number and expiration time in localStorage.
     * Starts a 5 minute timer after which the user can request a new verification email.
     */
    async function verifyEmail()  
    {
        const email = form.getValues("email");

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.warning('Verificar Email',{description: 'Por favor, ingrese una dirección de correo electrónico válida'});
            return; // Prevent form submission if email is invalid
        }
        // disable button for 5 minutes
        setDisabled(true)
        setTimeLeft(5 * 60); // start the 5 minute timer
        // generate a random 4-digit number
        const randomNumber = Math.floor(Math.random() * 9000 + 1000);

        // set expiration time to 5 minutes from now
        const expirationTime = new Date().getTime() + 5 * 60 * 1000;

        // save number and expiration time in localStorage
        localStorage.setItem('verificationNumber', JSON.stringify({ randomNumber, expirationTime }));

        // send email verification
        await EmailService.sendEmailRandom(email, randomNumber);
        
        // disable button after 5 minutes (300,000 ms)
        setTimeout(() => {
            setDisabled(false);
        }, 5 * 60 * 1000);
    }
    /**
     * Returns the verification number stored in localStorage if it exists and has not expired.
     * If the number has expired, it is removed from localStorage.
     * @returns {string} The verification number if it exists and has not expired, otherwise an empty string.
     */
    function getVerificationNumber():string {
        const storedData = localStorage.getItem('verificationNumber');
        if (storedData) {
            const { randomNumber, expirationTime } = JSON.parse(storedData);
            const currentTime = new Date().getTime();
            
            // verify if number has expired
            if (currentTime < expirationTime) {
                return randomNumber; // valid number
            } else {
                localStorage.removeItem('verificationNumber'); // Borrar el dato si ha expirado
            }
        }
        return ''; // if it does not exist or has expired
    }
}