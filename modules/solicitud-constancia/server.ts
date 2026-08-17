import 'server-only'

export {
  getConstanciaCatalogs,
  getConstanciaTexts,
  getConstanciaTypes,
} from '@/modules/solicitud-constancia/infrastructure/server/constancia-catalog.repository'
export { validateConstanciaRequestPrice } from '@/modules/solicitud-constancia/infrastructure/server/constancia-price-validation'
