import { httpClient } from '@/modules/shared/infrastructure/http/http-client';

export type MailRequestDto = {
  type: string;
  email: string;
  user?: string;
  number?: number;
};

export class MailApiRepository {
  async send(body: MailRequestDto): Promise<void> {
    await httpClient.post<MailRequestDto, MailRequestDto>('mailer', body);
  }
}

export const mailApiRepository = new MailApiRepository();
