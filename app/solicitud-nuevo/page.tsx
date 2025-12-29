import Process from '@/modules/solicitud-nuevo/components/process'
import IProgram from '@/modules/solicitud-nuevo/interfaces/programs.interface'

async function getPrograms():Promise<IProgram[]> {
    try{
        const res = await fetch('https://api.q10.com/v1/programas?Limit=30', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
                'Api-Key': process.env.API_KEY_Q10 || ''
            }
        })
        if(!res.ok){
            throw new Error('Error al obtener los programas')
        }
        let data:IProgram[] = await res.json()
        data = data.filter((program:IProgram) => program.Numero_resolucion === null)
        return data
    }catch(error){
        console.log(error)
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
