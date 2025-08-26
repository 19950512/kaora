'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Menu, 
  X, 
  Home, 
  Users, 
  Building2, 
  FileText, 
  DollarSign, 
  Settings, 
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Bell,
  User
} from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import { cn } from '@/lib/utils'

// Estrutura do menu
const menuItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: Home,
  },
  {
    title: 'Clientes',
    icon: Users,
    children: [
      { title: 'Lista de Clientes', href: '/clientes' },
      { title: 'Novo Cliente', href: '/clientes/novo' },
    ]
  },
  {
    title: 'Imóveis',
    icon: Building2,
    children: [
      { title: 'Lista de Imóveis', href: '/imoveis' },
      { title: 'Novo Imóvel', href: '/imoveis/novo' },
    ]
  },
  {
    title: 'Contratos',
    icon: FileText,
    children: [
      { title: 'Contratos Ativos', href: '/contratos' },
      { title: 'Novo Contrato', href: '/contratos/novo' },
      { title: 'Histórico', href: '/contratos/historico' },
    ]
  },
  {
    title: 'Financeiro',
    icon: DollarSign,
    children: [
      { title: 'Receitas', href: '/financeiro/receitas' },
      { title: 'Despesas', href: '/financeiro/despesas' },
      { title: 'Relatórios', href: '/financeiro/relatorios' },
    ]
  },
  {
    title: 'Configurações',
    href: '/configuracoes',
    icon: Settings,
  },
]

interface LayoutWithSidebarProps {
  children: React.ReactNode
}

export default function LayoutWithSidebar({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const pathname = usePathname()

  // Auto-expand menu item based on current path
  useEffect(() => {
    const currentMenuItem = menuItems.find(item => 
      item.children?.some(child => pathname.startsWith(child.href))
    )
    if (currentMenuItem && !expandedItems.includes(currentMenuItem.title)) {
      setExpandedItems(prev => [...prev, currentMenuItem.title])
    }
  }, [pathname])

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    )
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-50 bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        sidebarCollapsed ? 'lg:w-16' : 'lg:w-64',
        'w-64'
      )}>
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className={cn(
            "flex items-center justify-between h-16 px-4 border-b border-sidebar-border",
            sidebarCollapsed ? "lg:justify-center lg:px-2" : ""
          )}>
            <div className={cn("flex items-center space-x-3", sidebarCollapsed ? "lg:hidden" : "")}>
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-sidebar-foreground">Locação</h1>
                <p className="text-xs text-sidebar-foreground/60">Sistema de Gestão</p>
              </div>
            </div>
            
            {/* Logo only for collapsed state */}
            <div className={cn("w-8 h-8 bg-primary rounded-lg flex items-center justify-center", sidebarCollapsed ? "lg:block" : "lg:hidden")}>
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>

            {/* Collapse button - visible only on desktop */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={cn(
                "hidden lg:flex p-1 rounded-md hover:bg-sidebar-accent transition-colors",
                sidebarCollapsed ? "lg:hidden" : ""
              )}
              title={sidebarCollapsed ? "Expandir menu" : "Colapsar menu"}
            >
              <ChevronLeft className="w-5 h-5 text-sidebar-foreground" />
            </button>

            {/* Expand button for collapsed state */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={cn(
                "hidden p-1 rounded-md hover:bg-sidebar-accent transition-colors absolute right-2 top-4",
                sidebarCollapsed ? "lg:flex" : "lg:hidden"
              )}
              title="Expandir menu"
            >
              <ChevronRight className="w-4 h-4 text-sidebar-foreground" />
            </button>

            {/* Close button - visible only on mobile */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md hover:bg-sidebar-accent"
            >
              <X className="w-5 h-5 text-sidebar-foreground" />
            </button>
          </div>

          {/* Navigation */}
          <nav className={cn("flex-1 py-4 space-y-2 overflow-y-auto sidebar-scroll", sidebarCollapsed ? "lg:px-2" : "px-4")}>
            {menuItems.map((item) => (
              <div key={item.title}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors group',
                      isActive(item.href)
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                      sidebarCollapsed ? 'lg:justify-center lg:px-2' : ''
                    )}
                    onClick={() => setSidebarOpen(false)}
                    title={sidebarCollapsed ? item.title : undefined}
                  >
                    <item.icon className={cn("w-5 h-5", sidebarCollapsed ? "lg:mr-0" : "mr-3")} />
                    <span className={cn(sidebarCollapsed ? "lg:hidden" : "")}>{item.title}</span>
                  </Link>
                ) : (
                  <div>
                    <button
                      onClick={() => toggleExpanded(item.title)}
                      className={cn(
                        'flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors group',
                        'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                        sidebarCollapsed ? 'lg:justify-center lg:px-2' : ''
                      )}
                      title={sidebarCollapsed ? item.title : undefined}
                    >
                      <div className="flex items-center">
                        <item.icon className={cn("w-5 h-5", sidebarCollapsed ? "lg:mr-0" : "mr-3")} />
                        <span className={cn(sidebarCollapsed ? "lg:hidden" : "")}>{item.title}</span>
                      </div>
                      <div className={cn(sidebarCollapsed ? "lg:hidden" : "")}>
                        {expandedItems.includes(item.title) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </div>
                    </button>
                    {expandedItems.includes(item.title) && item.children && (
                      <div className={cn("ml-6 mt-1 space-y-1", sidebarCollapsed ? "lg:hidden" : "")}>
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              'block px-3 py-2 text-sm rounded-lg transition-colors',
                              isActive(child.href)
                                ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                                : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                            )}
                            onClick={() => setSidebarOpen(false)}
                          >
                            {child.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className={cn("transition-all duration-300", sidebarCollapsed ? "lg:pl-16" : "lg:pl-64")}>
        {/* Top header */}
        <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md hover:bg-accent transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-foreground">
                  Sistema de Locação
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 rounded-full hover:bg-accent transition-colors cursor-pointer">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Theme toggle */}
              <ThemeToggle />

              {/* User profile */}
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-foreground">João Silva</p>
                  <p className="text-xs text-muted-foreground">Administrador</p>
                </div>
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
