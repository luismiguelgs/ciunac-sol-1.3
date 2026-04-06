export default function RequestBeca({ children, }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <div className="flex flex-col flex-grow">
            <header className="bg-primary text-primary-foreground">
                <div className="container mx-auto px-4">
                    <div className="h-14 flex items-center">
                        <h1 className="text-lg font-semibold">
                            SOLICITUD - BECA CIUNAC
                        </h1>
                    </div>
                </div>
            </header>
            <main className="p-1">
                {children}
            </main>
        </div>
    );
}