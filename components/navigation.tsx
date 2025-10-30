"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Users, Lock, CheckSquare, Bell, Shield, User as UserIcon, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"

interface NavigationProps {
  isAdmin?: boolean
  user?: {
    display_name: string
    avatar_url: string | null
  }
}

export function Navigation({ isAdmin = false, user }: NavigationProps) {
  const pathname = usePathname()
  const router = useRouter()

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/relacje", label: "Relacje", icon: Users },
    { href: "/locki", label: "Locki", icon: Lock },
    { href: "/zadania", label: "Zadania", icon: CheckSquare },
    { href: "/powiadomienia", label: "Powiadomienia", icon: Bell },
  ]

  if (isAdmin) {
    links.push({ href: "/admin", label: "Admin", icon: Shield })
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace("/auth/logowanie")
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 md:top-0 md:bottom-auto md:border-b md:border-t-0 z-50 safe-area-inset-bottom">
      <div className="container mx-auto px-2 md:px-4">
        <div className="flex items-center justify-between py-2 md:py-3">
          {/* Linki nawigacji */}
          <div className="flex items-center justify-around md:justify-start md:gap-2 flex-1 md:flex-initial">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-0 md:gap-2 px-3 py-2 rounded-lg transition-colors min-w-[52px] md:min-w-0",
                    isActive ? "text-blue-400 bg-blue-400/10" : "text-slate-400 hover:text-white hover:bg-slate-800/50",
                  )}
                >
                  <Icon className="h-6 w-6 md:h-5 md:w-5" />
                  {/* Mobile: ukryj podpisy; Desktop: pokaż */}
                  <span className="hidden md:inline text-sm font-medium">{link.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Avatar / Nazwa: dropdown z akcjami */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 rounded-lg transition-colors hover:bg-slate-800/50 ml-2 md:ml-auto"
                  aria-label="Menu użytkownika"
                >
                  {/* Desktop: podpisy; Mobile: tylko avatar */}
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-medium text-slate-200">{user.display_name}</p>
                  </div>
                  <Avatar className="h-9 w-9 md:h-10 md:w-10 border-2 border-slate-700">
                    <AvatarImage src={user.avatar_url || undefined} alt={user.display_name} />
                    <AvatarFallback className="bg-slate-800 text-slate-200 text-sm">
                      {user.display_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={8} className="w-56">
                <DropdownMenuLabel className="truncate">{user.display_name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/profil">
                  <DropdownMenuItem className="cursor-pointer">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Edytuj profil</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/powiadomienia">
                  <DropdownMenuItem className="cursor-pointer">
                    <Bell className="mr-2 h-4 w-4" />
                    <span>Powiadomienia</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-red-400 focus:text-red-400" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Wyloguj się</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  )
}
