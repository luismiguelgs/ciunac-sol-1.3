import { RegisterSolicitudBecaUseCase } from '@/modules/solicitud-beca/application/use-cases/register-solicitud-beca.use-case';
import { BecaEmailGateway } from '@/modules/solicitud-beca/infrastructure/api/beca-email.gateway';
import { SolicitudBecaApiGateway } from '@/modules/solicitud-beca/infrastructure/api/solicitud-beca-api.gateway';

export function createRegisterSolicitudBecaUseCase() {
  return new RegisterSolicitudBecaUseCase({
    solicitudGateway: new SolicitudBecaApiGateway(),
    notificationGateway: new BecaEmailGateway(),
  });
}
