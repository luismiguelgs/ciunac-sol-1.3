import Image from 'next/image';
import { AlertTriangle } from 'lucide-react';

type Props = {
  confirmed: boolean;
};

export default function NotificationResult({ confirmed }: Props) {
  if (!confirmed) {
    return (
      <div className="flex max-w-xs flex-col items-center text-center">
        <AlertTriangle className="h-16 w-16 text-amber-500" />
        <span className="mt-2 text-base font-semibold text-amber-700">
          No se pudo confirmar el estado del correo. No vuelva a registrar la solicitud.
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <Image src="/images/send-email.png" alt="Correo procesado" width={80} height={80} className="rounded-lg shadow-md" />
      <span className="mt-2 text-lg font-semibold text-blue-700">
        El servicio acepto el correo de confirmacion.
      </span>
    </div>
  );
}
