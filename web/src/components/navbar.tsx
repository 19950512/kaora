'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, Home, Menu, X } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Clientes', href: '/clientes', icon: Users },
]

export function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="bg-card border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <h1 className="text-xl font-bold text-primary">Sistema de Locação</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors',
                      pathname === item.href
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                    )}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <ThemeToggle />
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <ThemeToggle />
            <button
              type="button"
              className="ml-2 inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Abrir menu principal</span>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="space-y-1 pt-2 pb-3">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'block pl-3 pr-4 py-2 text-base font-medium border-l-4 transition-colors',
                    pathname === item.href
                      ? 'bg-accent border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:border-border'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </nav>
  )
}
