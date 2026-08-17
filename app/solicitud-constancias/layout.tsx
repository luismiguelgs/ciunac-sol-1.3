export default function SolicitudConstanciasLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex flex-grow flex-col">
      <header className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="flex h-14 items-center">
            <h1 className="text-lg font-semibold">SOLICITUD - CONSTANCIAS</h1>
          </div>
        </div>
      </header>
      <main className="p-1">{children}</main>
    </div>
  )
}
