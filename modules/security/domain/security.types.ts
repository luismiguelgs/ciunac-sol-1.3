export const OTP_PURPOSES = [
  'CERTIFICADO',
  'BECA',
  'UBICACION',
  'CONSTANCIA',
  'NUEVO',
] as const;

export type OtpPurpose = (typeof OTP_PURPOSES)[number];

export const CONSULTATION_TYPES = ['CERTIFICADO', 'EXAMEN'] as const;

export type ConsultationType = (typeof CONSULTATION_TYPES)[number];

export type NotificationType = 'CERTIFICADO' | 'CONSTANCIA' | 'BECA' | 'UBICACION' | 'REGISTER';
