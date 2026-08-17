import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Consulta de Certificado | CIUNAC',
  robots: {
    index: false,
    follow: false,
  },
}

export default function ConsultaCertificadoLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
