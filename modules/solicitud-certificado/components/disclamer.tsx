'use client'

import MyAlert from "@/components/forms/myAlert"
import { useCatalogStore } from '@/hooks/useCatalogStore'
import { useTextsStore } from "@/stores/types.stores"
import React from "react"

export default function Disclamer() 
{
    const { data: textos } = useCatalogStore(useTextsStore)
    return (
        <React.Fragment>
            <div className="grid grid-cols-1 gap-1">
                <MyAlert
                    title='Atención'
                    description={textos?.find(objeto=> objeto.codigo === 'TEXTO_1_FINAL')?.contenido}
                    type='info'
                />
                <MyAlert
                    title='Importante'
                    description={textos?.find(objeto=> objeto.codigo === 'TEXTO_1_DISCLAMER')?.contenido}
                    type='warning'
                />
                <MyAlert
                    title='Importante'
                    description={textos?.find(objeto=> objeto.codigo === 'TEXTO_2_DISCLAMER')?.contenido}
                    type='warning'
                />
            </div>
        </React.Fragment>
    )
}
