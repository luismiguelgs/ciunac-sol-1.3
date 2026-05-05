import { CheckDuplicateSolicitudUbicacionUseCase } from '@/modules/solicitud-ubicacion/application/use-cases/check-duplicate-solicitud-ubicacion.use-case';
import { SolicitudUbicacionApiGateway } from '@/modules/solicitud-ubicacion/infrastructure/api/solicitud-ubicacion-api.gateway';

export function createCheckDuplicateSolicitudUbicacionUseCase() {
  return new CheckDuplicateSolicitudUbicacionUseCase(new SolicitudUbicacionApiGateway());
}
