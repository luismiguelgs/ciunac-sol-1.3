'use client'
import { IFacultad } from '@/interfaces/types.interface'
import TypesService, { Collection } from '@/services/types.service'
import React from 'react'
import useStore from './useStore'
import { useFacultiesStore } from '@/stores/types.stores'

const useFacultades = () => {
    const items = useStore(useFacultiesStore, (state) => state.faculties)
    const [data, setData] = React.useState<IFacultad[] | undefined>(items)

    React.useEffect(() => {
        const getData = async () => {
            const result = await TypesService.fetchItems<IFacultad>(Collection.Facultades)
            useFacultiesStore.setState({ faculties: result })
            setData(result)
        }
        if(!data || data.length === 0) getData()
    }, [])

    return data
}

export default useFacultades