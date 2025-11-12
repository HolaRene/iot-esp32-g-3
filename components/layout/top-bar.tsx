"use client"

import { Menu, Bell, Settings } from "lucide-react"

interface TopBarProps {
  onMenuClick: () => void
}

export function TopBar({ onMenuClick }: TopBarProps) {
  return (
    <div className="h-16 border-b border-border bg-card flex items-center justify-between px-4 md:px-6">
      <button onClick={onMenuClick} className="md:hidden p-2 hover:bg-muted rounded-lg transition-smooth">
        <Menu size={20} />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-muted rounded-lg transition-smooth relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
        </button>
        <button className="p-2 hover:bg-muted rounded-lg transition-smooth">
          <Settings size={20} />
        </button>
      </div>
    </div>
  )
}
