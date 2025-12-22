'use client'
import { ITipoSolicitud } from '@/interfaces/types.interface'
import TypesService from '@/services/types.service'
import React from 'react'
import useStore from './useStore'
import { useDocumentsStore } from '@/stores/types.stores'
import { Collection } from '@/services/types.service'

const useSolicitudes = () => {
    const subjects = useStore(useDocumentsStore, (state) => state.documents)
    const [data, setData] = React.useState<ITipoSolicitud[] | undefined>(subjects)

    React.useEffect(() => {
        const getData = async () => {
            const result = await TypesService.fetchItems<ITipoSolicitud>(Collection.Tiposolicitud)
            useDocumentsStore.setState({ documents: result })
            setData(result)
        }
        if(!data || data.length === 0) getData()
    }, [data])
    return data
}

export default useSolicitudes