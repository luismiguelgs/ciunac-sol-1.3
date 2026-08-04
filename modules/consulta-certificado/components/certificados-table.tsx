import RequestTypesPriceTable from '@/modules/shared/components/request-types-price-table'
import { ITipoSolicitud } from '@/modules/shared/interfaces/types.interface'

export default function CertificadosTable({ data }: { data: ITipoSolicitud[] }) {
  return <RequestTypesPriceTable data={data} emptyLabel="No hay certificados disponibles." />
}
