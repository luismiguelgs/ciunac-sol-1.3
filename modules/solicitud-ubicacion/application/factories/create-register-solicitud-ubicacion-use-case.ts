import { RegisterSolicitudUbicacionUseCase } from '@/modules/solicitud-ubicacion/application/use-cases/register-solicitud-ubicacion.use-case';
import { StudentUbicacionApiGateway } from '@/modules/solicitud-ubicacion/infrastructure/api/student-ubicacion-api.gateway';
import { SolicitudUbicacionApiGateway } from '@/modules/solicitud-ubicacion/infrastructure/api/solicitud-ubicacion-api.gateway';
import { UbicacionEmailGateway } from '@/modules/solicitud-ubicacion/infrastructure/api/ubicacion-email.gateway';

export function createRegisterSolicitudUbicacionUseCase() {
  return new RegisterSolicitudUbicacionUseCase({
    studentGateway: new StudentUbicacionApiGateway(),
    solicitudGateway: new SolicitudUbicacionApiGateway(),
    notificationGateway: new UbicacionEmailGateway(),
  });
}
