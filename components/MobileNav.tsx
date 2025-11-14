"use client"

import { Sheet, SheetClose, SheetContent, SheetTrigger } from "./ui/sheet"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Database, Home, Settings, SquareChevronLeft, Thermometer } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

const links = [
    { name: "Dashboard", href: "/dashboard", icon: <Home className="w-5 h-5" /> },
    { name: "Sensores", href: "/dispositivos-flexis", icon: <Thermometer className="w-5 h-5" /> },
    { name: "Datos", href: "/#", icon: <Database className="w-5 h-5" /> },
    { name: "Configuración", href: "/configuracion", icon: <Settings className="w-5 h-5" /> },
]

interface UserProfile {
    id: string
    email?: string
    user_metadata?: {
        full_name?: string
        avatar_url?: string
    }
}


const MobileNav = () => {
    const pathname = usePathname()

    const [user, setUser] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    // Obtener usuario actual
    useEffect(() => {
        const getUser = async () => {
            try {
                const { data: { user: currentUser } } = await supabase.auth.getUser()
                setUser(currentUser)
            } catch (error) {
                console.error("Error getting user:", error)
            } finally {
                setLoading(false)
            }
        }

        getUser()

        // Escuchar cambios de autenticación
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [supabase])


    return (
        <section className='md:hidden'>
            <Sheet>
                {user && (<SheetTrigger>
                    <SquareChevronLeft />
                </SheetTrigger>)}
                <SheetContent side="left" className="bg-black text-white border-none">

                    <div className="flex flex-col justify-between h-cal(100ch-75px)] overflow-y-auto mt-10">
                        <SheetClose asChild>
                            <nav className="flex h-full flex-col gap-6 text-white-1">
                                {links.map(({ href, icon, name }) => {
                                    const isActive = pathname === href || pathname.startsWith(`${href}/`); // Lógica para determinar si el enlace está activo
                                    return <SheetClose key={name} asChild><Link href={href} className={cn("flex gap-3 py-4 max-lg:px-4 justify-start  items-center", {
                                        'bg-nav-focus border-r-4 border-orange-1': isActive,
                                    })}>
                                        {icon}
                                        <p>{name}</p>
                                    </Link>
                                    </SheetClose>
                                })
                                }
                            </nav>
                        </SheetClose>
                    </div>
                </SheetContent>
            </Sheet>
        </section>
    )
}

export default MobileNav