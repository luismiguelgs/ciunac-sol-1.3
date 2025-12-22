'use client'
import { IIdioma } from '@/interfaces/types.interface'
import TypesService, { Collection } from '@/services/types.service'
import React from 'react'
import useStore from './useStore'
import { useSubjectsStore } from '@/stores/types.stores'

const useSubjects = () => {
    const subjects = useStore(useSubjectsStore, (state) => state.subjects)
    const [data, setData] = React.useState<IIdioma[] | undefined>(subjects)
    const [loading, setLoading] = React.useState<boolean>(false)

    React.useEffect(() => {
        const getData = async () => {
            setLoading(true)
            const result = await TypesService.fetchItems<IIdioma>(Collection.Idiomas)
            useSubjectsStore.setState({ subjects: result })
            setData(result)
            setLoading(false)
        }
        if(!data || data.length === 0) getData()
    }, [])

    return {data, loading}
}

export default useSubjects