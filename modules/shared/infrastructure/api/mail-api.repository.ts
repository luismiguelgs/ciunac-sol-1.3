import { NotificationType } from '@/modules/security/domain/security.types';
import { sendSecureNotification } from '@/modules/security/client/security-client';

export type MailRequestDto = {
  type: NotificationType;
  reference: string;
};

export class MailApiRepository {
  async send(body: MailRequestDto): Promise<string> {
    const response = await sendSecureNotification(body.type, body.reference);
    if (!response.receiptId) {
      throw new Error('Notification receipt is missing');
    }
    return response.receiptId;
  }
}

export const mailApiRepository = new MailApiRepository();
