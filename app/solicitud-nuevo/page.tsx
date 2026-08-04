import Process from '@/modules/solicitud-nuevo/components/process'
import IProgram from '@/modules/solicitud-nuevo/interfaces/programs.interface'
import { getQ10ApiKey } from '@/modules/security/server/environment'
import EmptyState from '@/modules/shared/components/empty-state'

export const dynamic = 'force-dynamic'

async function getPrograms():Promise<IProgram[]> {
        const res = await fetch('https://api.q10.com/v1/programas?Limit=30', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Api-Key': getQ10ApiKey(),
            },
            cache: 'no-store',
        })
        if(!res.ok){
            throw new Error('Error al obtener los programas')
        }
        const payload: unknown = await res.json().catch(() => {
            throw new Error('Q10 devolvio una respuesta no valida')
        })
        if (!Array.isArray(payload)) throw new Error('Q10 devolvio una lista de programas no valida')
        let data = payload.filter((item): item is IProgram => typeof item === 'object' && item !== null && 'Numero_resolucion' in item)
        data = data.filter((program:IProgram) => program.Numero_resolucion === null)
        return data
}

export default async function NewStudentPage() 
{
    const programs = await getPrograms()

    if (programs.length === 0) {
        return (
            <main className="flex min-h-[60vh] items-center justify-center p-4">
                <EmptyState
                    title="No hay programas disponibles"
                    description="Q10 no tiene programas habilitados para el registro en este momento."
                    href="/"
                />
            </main>
        )
    }

    return (
        <>
            <Process programs={programs} />
        </>
    )
}
