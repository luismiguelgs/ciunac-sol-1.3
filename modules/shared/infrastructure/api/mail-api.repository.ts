import { NotificationType } from '@/modules/security/domain/security.types';
import { sendSecureNotification } from '@/modules/security/client/security-client';

export type MailRequestDto = {
  type: NotificationType;
  reference: string;
};

export class MailApiRepository {
  async send(body: MailRequestDto): Promise<void> {
    await sendSecureNotification(body.type, body.reference);
  }
}

export const mailApiRepository = new MailApiRepository();
