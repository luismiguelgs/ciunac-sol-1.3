import Image from "next/image";
import Link from "next/link";
import logoCiunac from '@/assets/logo-ciunac.jpg'
import packageJson from "@/package.json";

function getVersion() {
    return packageJson.version;
}

type Props = {
    compact?: boolean
}

export default function Copyright({ compact = false }: Props) {
    const logoSize = compact ? 220 : 310
    const logoHeight = Math.round((logoSize * logoCiunac.height) / logoCiunac.width)

    return (
        <div className={compact ? 'mx-2 my-1 flex flex-col items-center' : 'mx-4 my-2 flex flex-col items-center'}>
            <Image
                src={logoCiunac}
                alt="CIUNAC Logo"
                width={logoSize}
                height={logoHeight}
                priority
                className="h-auto max-w-full"
            />
            <p className={compact
                ? 'mt-1 text-center text-xs text-muted-foreground'
                : 'mt-1 text-center text-sm text-muted-foreground'}>
                Copyright © {' '}
                <Link
                    href="https://ciunac.unac.edu.pe/"
                    className="text-muted-foreground hover:text-primary"
                >
                    CIUNAC
                </Link>
                {` ${new Date().getFullYear()}. versión: ${getVersion()}`}
            </p>
        </div>
    );
}
