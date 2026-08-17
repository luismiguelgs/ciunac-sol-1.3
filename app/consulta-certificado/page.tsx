import ConsultaPage from '@/modules/shared/components/consulta-wrapper'

export default function ConsultaCertificadoPage() {
  return (
    <ConsultaPage>
      <div className="space-y-3 text-center">
        <h1 className="text-2xl font-bold">Consulta de certificado</h1>
        <p className="text-sm text-muted-foreground">
          Escanee el código QR incluido en el certificado para verificar su información.
        </p>
      </div>
    </ConsultaPage>
  )
}
