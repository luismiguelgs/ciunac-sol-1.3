'use client'

import useStore from "./useStore";
import { useEscuelasStore } from "../stores/types.stores";
import TypesService, { Collection } from "../services/types.service";
import React from "react";
import { IEscuela } from "../interfaces/types.interface";

const useEscuelas = () => {
    const items = useStore(useEscuelasStore, (state) => state.escuelas)
    const [data, setData] = React.useState<IEscuela[] | undefined>(items)

    React.useEffect(() => {
        const getData = async () => {
            const result = await TypesService.fetchItems<IEscuela>(Collection.Escuelas)
            useEscuelasStore.setState({ escuelas: result })
            setData(result)
        }
        if (!data || data.length === 0) getData()
    }, [])

    return data
}

export default useEscuelas
