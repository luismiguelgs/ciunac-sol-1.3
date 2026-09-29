import { NotificationType } from '@/modules/security/domain/security.types';
import { sendSecureNotification } from '@/modules/security/client/security-client';

type MailRequestDto = {
  type: NotificationType;
  reference: string;
};

export const mailApiRepository = {
  async send(body: MailRequestDto): Promise<string> {
    const response = await sendSecureNotification(body.type, body.reference);
    if (!response.receiptId) {
      throw new Error('Notification receipt is missing');
    }
    return response.receiptId;
  },
}
