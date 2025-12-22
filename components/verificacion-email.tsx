import Image from 'next/image'
import React from 'react'
import MyAlert from './forms/myAlert'
import Copyright from './copyright'

export default function VerificacionEmail() {
    return (
        <React.Fragment>
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
                <Copyright />
            </div>
        </React.Fragment>
    )
}
