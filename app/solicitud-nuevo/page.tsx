import Process from '@/modules/solicitud-nuevo/components/process'
import IProgram from '@/modules/solicitud-nuevo/interfaces/programs.interface'
import { getQ10ApiKey } from '@/modules/security/server/environment'

export const dynamic = 'force-dynamic'

async function getPrograms():Promise<IProgram[]> {
    try{
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
        let data:IProgram[] = await res.json()
        data = data.filter((program:IProgram) => program.Numero_resolucion === null)
        return data
    }catch{
        return [] 
    }
}

export default async function NewStudentPage() 
{
    const programs = await getPrograms()

    return (
        <>
            <Process programs={programs} />
        </>
    )
}
