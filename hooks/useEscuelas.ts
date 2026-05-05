'use client'

import { useEscuelasStore } from "../stores/types.stores"
import TypesService, { Collection } from "../services/types.service"
import { IEscuela } from "@/modules/shared/interfaces/types.interface"
import React from "react"
import { useCachedFetch } from "./useCachedFetch"

export default function useEscuelas() {
  const fetchEscuelas = React.useCallback(
    () => TypesService.fetchItems<IEscuela>(Collection.Escuelas),
    []
  )

  const { data } = useCachedFetch<IEscuela>(
    useEscuelasStore,
    fetchEscuelas
  )
  return data
}

