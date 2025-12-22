import Image from "next/image";
import Link from "next/link";
import logoCiunac from '@/assets/logo-ciunac.jpg'
import packageJson from "@/package.json";

function getVersion() {
    return packageJson.version;
}

export default function Copyright() {
    return (
        <div className="mx-4 my-2 flex flex-col items-center">
            <Image
                src={logoCiunac}
                alt="CIUNAC Logo"
                style={{ width: 'auto', height: 'auto' }}
                width={310}
                height={310}
                priority
                className="w-[310px] h-auto"
            />
            <p className="mt-1 text-sm text-muted-foreground text-center">
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