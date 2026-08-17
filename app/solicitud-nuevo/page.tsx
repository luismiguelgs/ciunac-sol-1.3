import { NewStudentProcess } from '@/modules/solicitud-nuevo'
import { getNewStudentPrograms } from '@/modules/solicitud-nuevo/server'
import EmptyState from '@/modules/shared/components/empty-state'

export const dynamic = 'force-dynamic'

export default async function NewStudentPage() {
    const programs = await getNewStudentPrograms()

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
            <NewStudentProcess programs={programs} />
        </>
    )
}
