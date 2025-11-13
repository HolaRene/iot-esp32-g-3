"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Home, Thermometer, Settings, Database } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Sidebar() {
  const [open, setOpen] = useState(false)

  const toggleSidebar = () => setOpen(!open)

  const links = [
    { name: "Dashboard", href: "/dashboard", icon: <Home className="w-5 h-5" /> },
    { name: "Sensores", href: "/dispositivos-flexis", icon: <Thermometer className="w-5 h-5" /> },
    { name: "Datos", href: "/#", icon: <Database className="w-5 h-5" /> },
    { name: "Configuración", href: "/configuracion", icon: <Settings className="w-5 h-5" /> },
  ]

  return (
    <>
      {/* Botón hamburguesa (visible solo en móvil) */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          className="bg-background border"
          onClick={toggleSidebar}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Sidebar en pantallas grandes */}
      <div className="hidden md:flex flex-col w-64 h-screen bg-card border-r border-border shadow-sm fixed left-0 top-0 z-40">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Panel IoT</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="flex items-center gap-3 p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Sidebar móvil (drawer animado) */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed top-0 left-0 w-64 h-full bg-card border-r border-border shadow-md z-50 flex flex-col"
          >
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Panel IoT</h2>
              <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <nav className="flex-1 p-4 space-y-2">
              {links.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fondo oscuro cuando el menú está abierto (solo móvil) */}
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          exit={{ opacity: 0 }}
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black md:hidden z-40"
        />
      )}
    </>
  )
}
