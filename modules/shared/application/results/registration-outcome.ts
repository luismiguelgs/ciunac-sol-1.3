import { AppError } from '@/modules/shared/application/errors/app-error';

export type RegistrationOutcome =
  | {
      status: 'completed';
      requestId: string;
      notificationReceiptId: string;
    }
  | {
      status: 'saved_notification_failed';
      requestId: string;
      error: AppError;
    };
