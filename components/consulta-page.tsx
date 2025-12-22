import { Lock } from "lucide-react"
import Copyright from "@/components/copyright"
import Image from "next/image"

interface ConsultaPageProps {
    children: React.ReactNode
}

export default function ConsultaPage({ children }: ConsultaPageProps) 
{
    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">
                        <div className="flex flex-col gap-6">
                            <div className="flex justify-center">
                                <Lock className="h-12 w-12 text-primary" />
                            </div>
                            {children}
                        </div>
                        <Copyright />
                    </div>
                </div>
            </div>
            <div className="relative hidden bg-muted lg:block">
                <Image
                    src="/images/splash.jpg"
                    alt="Image"
                    width={1920}
                    height={1080}
                    priority
                    className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
            </div>
        </div>
    )
}
