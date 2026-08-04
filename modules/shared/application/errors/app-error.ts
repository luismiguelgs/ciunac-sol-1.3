export type AppErrorCode =
  | 'VALIDATION'
  | 'AUTHENTICATION'
  | 'AUTHORIZATION'
  | 'EXTERNAL_SERVICE'
  | 'NETWORK'
  | 'UNEXPECTED';

type AppErrorParams = {
  code: AppErrorCode;
  message: string;
  status?: number;
  cause?: unknown;
  details?: unknown;
  correlationId?: string;
  retryable?: boolean;
};

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly status?: number;
  readonly details?: unknown;
  readonly correlationId?: string;
  readonly retryable: boolean;
  override readonly cause?: unknown;

  constructor({ code, message, status, cause, details, correlationId, retryable = false }: AppErrorParams) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.cause = cause;
    this.details = details;
    this.correlationId = correlationId;
    this.retryable = retryable;
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function normalizeAppError(error: unknown, fallbackMessage = 'Ocurrio un error inesperado'): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError({
      code: 'UNEXPECTED',
      message: fallbackMessage,
      cause: error,
    });
  }

  return new AppError({
    code: 'UNEXPECTED',
    message: fallbackMessage,
    details: error,
  });
}
