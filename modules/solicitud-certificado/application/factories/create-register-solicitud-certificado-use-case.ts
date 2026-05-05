import { RegisterSolicitudCertificadoUseCase } from '@/modules/solicitud-certificado/application/use-cases/register-solicitud-certificado.use-case';
import { CertificadoEmailGateway } from '@/modules/solicitud-certificado/infrastructure/api/certificado-email.gateway';
import { SolicitudApiGateway } from '@/modules/solicitud-certificado/infrastructure/api/solicitud-api.gateway';
import { StudentApiGateway } from '@/modules/solicitud-certificado/infrastructure/api/student-api.gateway';

export function createRegisterSolicitudCertificadoUseCase() {
  return new RegisterSolicitudCertificadoUseCase({
    studentGateway: new StudentApiGateway(),
    solicitudGateway: new SolicitudApiGateway(),
    notificationGateway: new CertificadoEmailGateway(),
  });
}
