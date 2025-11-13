"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "./ui/button"
import { Database, Home, Settings, TextCursorInputIcon, Thermometer } from "lucide-react"

const links = [
    { name: "Dashboard", href: "/dashboard", icon: <Home className="w-5 h-5" /> },
    { name: "Sensores", href: "/dispositivos-flexis", icon: <Thermometer className="w-5 h-5" /> },
    { name: "Datos", href: "/#", icon: <Database className="w-5 h-5" /> },
    { name: "Configuración", href: "/configuracion", icon: <Settings className="w-5 h-5" /> },
]

const LeftSidebar = () => {
    const pathname = usePathname()

    const isFDahsboar = pathname === '/' || pathname === '/auth/login' || pathname === '/auth/sign-up' || pathname === '/auth/sign-up-success' || pathname === '/auth/error' || pathname === '/auth/confirm' || pathname === '/auth/forgot-password' || pathname === '/auth/update-password';


    return (
        <section className={cn("left_sidebar h-[calc(100vh-5px)] flex flex-col justify-between", {
            'hidden': isFDahsboar
        })}>
            <nav className="flex flex-col gap-6 pl-5">
                <Link href="/" className="flex items-center grebg-green-400 pb-10 max-lg:justify-centers cursor-pointer ">
                    <TextCursorInputIcon />
                    <h1 className="text-24 font-extrabold max-lg:hidden">Inicio</h1>
                </Link>

                {links.map(({ href, icon, name }) => {
                    const isActive = pathname === href || pathname.startsWith(`${href}/`); // Lógica para determinar si el enlace está activo
                    return <Link key={name} href={href} className={cn("flex gap-3 py-4 max-lg:px-4 justify-center lg:justify-start items-center", {
                        'bg-nav-focus border-r-4 border-green-400 rounded-md border-t-2 ': isActive,
                    })}>
                        {icon}
                        <p>{name}</p>
                    </Link>
                })
                }
            </nav>
            <Link href={'/'} className="pl-5">
                <Button>
                    Cerrar sesión
                </Button>
            </Link>
        </section>
    )
}

export default LeftSidebar