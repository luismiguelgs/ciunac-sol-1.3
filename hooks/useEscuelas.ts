'use client'

import { useEscuelasStore } from "../stores/types.stores"
import TypesService, { Collection } from "../services/types.service"
import { IEscuela } from "@/modules/shared/interfaces/types.interface"
import { useCachedFetch } from "./useCachedFetch"

export default function useEscuelas() {
  const { data } = useCachedFetch<IEscuela>(
    useEscuelasStore,
    () => TypesService.fetchItems<IEscuela>(Collection.Escuelas)
  )
  return data
}

