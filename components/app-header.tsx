"use client"

import type React from "react"
import Link from "next/link"
import { Wrench, LogOut, LayoutDashboard, User, FileText } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { logout } from "@/app/actions/auth"
import { toast } from "sonner"

interface AppHeaderProps {
  title?: string
  showBackButton?: boolean
  backHref?: string
  action?: React.ReactNode
  userEmail?: string
  userName?: string // Added userName prop
}

export function AppHeader({ title, showBackButton, backHref = "/", action, userEmail, userName }: AppHeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const result = await logout()
      if (result.success) {
        toast.success("Logged out successfully")
        router.push("/auth/login")
        router.refresh()
      } else {
        toast.error(result.error || "Failed to logout")
      }
    } catch (err) {
      console.error("Logout error:", err)
      toast.error("Failed to logout")
    }
  }

  return (
    <header className="border-b bg-white px-6 py-4 shadow-sm sticky top-0 z-50">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="bg-primary p-2.5 rounded-xl">
              <Wrench className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-black tracking-tight uppercase text-slate-900">Mechanic Pro</h1>
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-primary">Digital Shop System</span>
            </div>
          </Link>

          {title && (
            <>
              <div className="hidden md:block h-6 w-px bg-slate-200" />
              <h2 className="hidden md:block text-base font-bold text-slate-600">{title}</h2>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {userEmail && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-slate-50 rounded-xl">
                  <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-slate-600" />
                  </div>
                  <div className="hidden md:flex flex-col items-start text-left">
                    <span className="text-xs font-black uppercase tracking-tight text-slate-900 leading-none">
                      {userName || "Mechanic"}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">{userEmail}</span>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-none p-2 mt-1">
                <DropdownMenuLabel className="font-black uppercase text-[10px] tracking-[0.2em] text-slate-400 px-3 py-2">
                  Control Center
                </DropdownMenuLabel>
                <DropdownMenuItem
                  asChild
                  className="rounded-lg cursor-pointer focus:bg-slate-50 focus:text-primary py-2 px-3"
                >
                  <Link href="/">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span className="font-bold text-sm">Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="rounded-lg cursor-pointer focus:bg-slate-50 focus:text-primary py-2 px-3"
                >
                  <Link href="/protected/invoices">
                    <FileText className="mr-2 h-4 w-4" />
                    <span className="font-bold text-sm">Invoices</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-100 mx-1 my-1" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="rounded-lg cursor-pointer focus:bg-red-50 focus:text-red-600 py-2 px-3 text-red-500"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span className="font-bold text-sm">Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {action}
        </div>
      </div>
    </header>
  )
}
