import Image from 'next/image'
import React from 'react'
import MyAlert from '@/components/forms/myAlert'
import Copyright from './copyright'

type Props = {
    priceTable?: React.ReactNode
}

export default function VerificacionEmail({ priceTable }: Props) {
    const compact = Boolean(priceTable)

    return (
        <React.Fragment>
            {/* Left Column */}
            <div className="flex flex-col items-center gap-3">
                <Image
                    src="/images/email-verification.png"
                    alt="Verificación de correo electrónico"
                    width={compact ? 140 : 190}
                    height={compact ? 140 : 190}
                />
                <MyAlert
                    title="Verificación en dos pasos:"
                    description={<>
                        Primero ingresa tu correo, confirma que no eres un robot y selecciona{' '}
                        <strong>COMPROBAR CORREO Y ENVIAR CÓDIGO</strong>. Después ingresa el código de 6 dígitos y
                        selecciona <strong>VERIFICAR CÓDIGO Y CONTINUAR</strong>. Si el mensaje no aparece, revisa
                        también tu carpeta de correo no deseado (SPAM).
                    </>}
                />
                {priceTable && (
                    <section aria-labelledby="request-price-table-title" className="w-full">
                        <h3 id="request-price-table-title" className="mb-2 text-center text-base font-semibold">
                            Tarifario
                        </h3>
                        {priceTable}
                    </section>
                )}
                <Copyright compact={compact} />
            </div>
        </React.Fragment>
    )
}
