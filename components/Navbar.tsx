"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { LogOut, Moon, Settings, Sun, User } from 'lucide-react'
import { createClient } from "@/lib/supabase/client"

// Componentes de shadcn
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "./ui/button"
import { useTheme } from "next-themes"
import { Skeleton } from "./ui/skeleton"
import MobileNav from "./MobileNav"
import { useRouter } from "next/navigation"

interface UserProfile {
    id: string
    email?: string
    user_metadata?: {
        full_name?: string
        avatar_url?: string
    }
}

const Navbar = () => {
    const { setTheme, } = useTheme()
    const [user, setUser] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const ruta = useRouter()

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

    // Manejar logout
    const handleLogout = async () => {
        try {
            await supabase.auth.signOut()
            setUser(null)
            ruta.push('/auth/login')
        } catch (error) {
            console.error("Error signing out:", error)
        }
    }

    // Obtener iniciales para el avatar
    const getUserInitials = (user: UserProfile) => {
        if (user.user_metadata?.full_name) {
            return user.user_metadata.full_name
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
        }
        return user.email?.slice(0, 2).toUpperCase() || 'US'
    }

    // Obtener nombre para mostrar
    const getDisplayName = (user: UserProfile) => {
        return user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario'
    }

    return (
        <nav className='p-4 flex items-center justify-between sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b'>
            <MobileNav />
            {/* Lado izquierdo - Logo/Brand */}
            <div className="flex items-center gap-4">
                <Link href={'/'} className="md:flex hidden sm:block items-center gap-2 ">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-sm hidden sm:block">TI</span>
                    </div>
                    <h1 className="font-bold text-xl hidden sm:block">Tablero IoT</h1>
                </Link>
            </div>

            {/* Lado derecho - Navegación y usuario */}
            <div className="flex items-center gap-4">
                {/* Navegación para usuarios autenticados */}
                {/* Selector de tema */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                            <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                            <span className="sr-only">Cambiar tema</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setTheme("light")}>
                            <Sun className="h-4 w-4 mr-2" />
                            Claro
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("dark")}>
                            <Moon className="h-4 w-4 mr-2" />
                            Oscuro
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("system")}>
                            <Settings className="h-4 w-4 mr-2" />
                            Sistema
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Avatar del usuario o botones de auth */}
                {loading ? (
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                ) : user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage
                                        src={user.user_metadata?.avatar_url}
                                        alt={getDisplayName(user)}
                                    />
                                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                        {getUserInitials(user)}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        {getDisplayName(user)}
                                    </p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {user.email}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/perfil" className="cursor-pointer">
                                    <User className="h-4 w-4 mr-2" />
                                    Perfil
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/configuracion" className="cursor-pointer">
                                    <Settings className="h-4 w-4 mr-2" />
                                    Configuración
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="text-destructive focus:text-destructive cursor-pointer"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Cerrar Sesión
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/auth/login">Iniciar Sesión</Link>
                        </Button>
                        <Button size="sm" asChild>
                            <Link href="/auth/register">Registrarse</Link>
                        </Button>
                    </div>
                )}
            </div>
        </nav>
    )
}

export default Navbar