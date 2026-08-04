'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ITipoSolicitud } from '@/modules/shared/interfaces/types.interface'

type Props = {
  data: ITipoSolicitud[]
  emptyLabel: string
}

export default function RequestTypesPriceTable({ data, emptyLabel }: Props) {
  const pricedItems = data.filter((item) => Number(item.precio) > 0)

  if (pricedItems.length === 0) {
    return <div className="text-sm text-muted-foreground">{emptyLabel}</div>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipo de Solicitud</TableHead>
            <TableHead className="text-right">Precio</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pricedItems.map((item, index) => (
            <TableRow key={item.id ?? index}>
              <TableCell className="font-medium">{item.solicitud}</TableCell>
              <TableCell className="text-right">{formatCurrency(Number(item.precio))}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
