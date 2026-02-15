"use client"

import { Button } from "@/components/ui/button"
import { logout } from "@/features/auth/actions"
import { LogOut, LayoutDashboard, History, Wallet } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function Sidebar() {
  const pathname = usePathname()

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, color: "text-blue-500" },
    { href: "/dashboard/trades", label: "Mis Trades", icon: History, color: "text-purple-500" },
    { href: "/dashboard/accounts", label: "Cuentas", icon: Wallet, color: "text-emerald-500" },
  ]

  return (
    <div className="flex flex-col h-screen w-72 border-r bg-card/50 backdrop-blur-xl p-6 transition-all duration-300">
      <div className="flex items-center gap-3 px-2 mb-10 group">
        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
          <Wallet className="h-6 w-6 text-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-xl tracking-tight">Antigravity</span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Trading Suite</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-8">
        <div>
          <h3 className="px-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-4">
            Menú Principal
          </h3>
          <nav className="space-y-2">
            {links.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                  )}
                >
                  <link.icon className={cn(
                    "h-5 w-5 transition-colors",
                    isActive ? "text-primary-foreground" : cn(link.color, "opacity-70 group-hover:opacity-100")
                  )} />
                  {link.label}
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground animate-pulse" />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Optional: Add a "Quick Stats" or similar section here later if needed */}
      </div>

      <div className="mt-auto pt-6 border-t border-border/50">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-xl h-11 transition-colors"
          onClick={() => logout()}
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Cerrar Sesión</span>
        </Button>
      </div>
    </div>
  )
}
