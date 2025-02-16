"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Home, Package, Users, FileText, UserCheck, LogOut, FileBarChart, UserCog, Menu, Barcode } from "lucide-react"
import ProductScanModal from "@/components/ProductScanModal"

export default function Navigation() {
  const { user, userData, logout } = useAuth()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isScanModalOpen, setIsScanModalOpen] = useState(false)

  if (!user) return null

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard", roles: ["admin", "user"] },
    { href: "/productos", icon: Package, label: "Productos", roles: ["admin", "user"] },
    { href: "/clientes", icon: Users, label: "Clientes", roles: ["admin", "user"] },
    { href: "/facturas", icon: FileText, label: "Facturas", roles: ["admin", "user"] },
    { href: "/reportes", icon: FileBarChart, label: "Reportes", roles: ["admin"] },
    { href: "/empleados", icon: UserCheck, label: "Empleados", roles: ["admin"] },
    { href: "/usuarios", icon: UserCog, label: "Usuarios", roles: ["admin"] },
  ]

  const filteredNavItems = navItems.filter((item) => {
    if (!userData?.role) return false
    return item.roles.includes(userData.role)
  })

  const isActive = (path: string) => pathname === path

  return (
    <nav className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex-shrink-0">
              <span className="text-2xl font-bold">GF Tire Shop</span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-colors duration-150 ease-in-out ${
                    isActive(item.href) ? "bg-white text-blue-600" : "text-white hover:bg-blue-400 hover:bg-opacity-25"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsScanModalOpen(true)}
              className="text-white hover:bg-blue-400 hover:bg-opacity-25 rounded-full"
            >
              <Barcode className="h-5 w-5 mr-2" />
              Escanear
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-white hover:bg-blue-400 hover:bg-opacity-25 rounded-full"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Cerrar sesión
            </Button>
          </div>
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-gradient-to-b from-blue-500 to-purple-600">
                <nav className="flex flex-col h-full">
                  <div className="flex-1 py-6">
                    <ul className="space-y-2">
                      {filteredNavItems.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={`flex items-center p-2 rounded-full ${
                              isActive(item.href)
                                ? "bg-white text-blue-600"
                                : "text-white hover:bg-blue-400 hover:bg-opacity-25"
                            }`}
                            onClick={() => setIsOpen(false)}
                          >
                            <item.icon className="h-5 w-5 mr-3" />
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="border-t border-blue-400 pt-4">
                    <div className="flex items-center mb-4 px-2">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src="/placeholder.svg" alt={userData?.name} />
                        <AvatarFallback>{userData?.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-white">{userData?.name}</p>
                        <p className="text-xs text-blue-200">{userData?.email}</p>
                      </div>
                    </div>
                    <Button
                      className="w-full rounded-full bg-white text-blue-600 hover:bg-blue-100 mb-2"
                      onClick={() => {
                        setIsScanModalOpen(true)
                        setIsOpen(false)
                      }}
                    >
                      <Barcode className="h-5 w-5 mr-2" />
                      Escanear Producto
                    </Button>
                    <Button className="w-full rounded-full bg-white text-blue-600 hover:bg-blue-100" onClick={logout}>
                      <LogOut className="h-5 w-5 mr-2" />
                      Cerrar sesión
                    </Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      <ProductScanModal isOpen={isScanModalOpen} onClose={() => setIsScanModalOpen(false)} />
    </nav>
  )
}

