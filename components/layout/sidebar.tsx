"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Zap, AlertTriangle, Settings, User, ChevronLeft, ChevronRight } from "lucide-react"

interface SidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Zap, label: "Devices", href: "/dispositivos-flexis" },
  { icon: AlertTriangle, label: "Alerts", href: "/alerts" },
  { icon: Settings, label: "Settings", href: "/settings" },
  { icon: User, label: "Profile", href: "/profile" },
]

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Overlay for mobile */}
      {open && <div className="fixed inset-0 z-40 md:hidden bg-black/50" onClick={() => onOpenChange(false)} />}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:static z-50 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col",
          open ? "w-64" : "w-20",
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border bg-gradient-to-r from-primary/10 to-transparent">
          {open && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                ⚙️
              </div>
              <span className="font-bold text-sm text-sidebar-foreground">IoT Platform</span>
            </div>
          )}
          <button
            onClick={() => onOpenChange(!open)}
            className="hidden md:flex p-1.5 hover:bg-sidebar-accent rounded-lg transition-smooth text-sidebar-foreground"
          >
            {open ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
          {!open && (
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
              ⚙️
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-smooth text-sm font-medium",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent",
                )}
              >
                <Icon size={20} className="flex-shrink-0" />
                {open && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="text-xs text-sidebar-foreground/60">{open && <p>IoT Platform v1.0</p>}</div>
        </div>
      </aside>
    </>
  )
}
