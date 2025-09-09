'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { 
  Menu, 
  X, 
  Home, 
  Users, 
  Box, 
  FileText, 
  DollarSign, 
  Settings, 
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Bell,
  User,
  LogOut
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
    title: 'Configurações',
    icon: Settings,
    children: [
      { title: 'Informações da Empresa', href: '/empresa/info' },
      { title: 'Auditoria', href: '/auditoria' },
      { title: 'Usuários', href: '/usuarios' },
      { title: 'Cargos', href: '/roles' },
    ]
  },
]

interface LayoutWithSidebarProps {
  children: React.ReactNode
}

export default function LayoutWithSidebar({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()

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

  const handleLogout = async () => {
    try {
      // Primeiro, chamar nossa API de logout personalizada
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('✅ [LOGOUT] Logout do servidor executado com sucesso');
      } else {
        console.warn('⚠️ [LOGOUT] Falha no logout do servidor');
      }
    } catch (error) {
      console.warn('⚠️ [LOGOUT] Erro ao chamar API de logout:', error);
    }

    // Sempre executar o signOut do NextAuth para limpar a sessão do cliente
    await signOut({ 
      callbackUrl: '/auth/login',
      redirect: true 
    });
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
          className="fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-50 border-r transition-all duration-300 ease-in-out lg:translate-x-0',
        'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        sidebarCollapsed ? 'lg:w-16' : 'lg:w-64',
        'w-64'
      )}
      style={{backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))'}}>
        <div className="flex flex-col h-full bg-white dark:bg-gray-900" style={{backgroundColor: 'hsl(var(--background))'}}>{/* Container principal */}
          {/* Sidebar header */}
          <div className={cn(
            "flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900",
            sidebarCollapsed ? "lg:justify-center lg:px-2" : ""
          )}
          style={{backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))'}}>
            <div className={cn("flex items-center space-x-3", sidebarCollapsed ? "lg:hidden" : "")}>
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Box className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100" style={{color: 'hsl(var(--foreground))'}}>Kaora</h1>
                <p className="text-xs text-gray-600 dark:text-gray-400" style={{color: 'hsl(var(--muted-foreground))'}}>Software de Gestão</p>
              </div>
            </div>
            
            {/* Logo only for collapsed state */}
            <div className={cn("w-8 h-8 bg-primary rounded-lg flex items-center justify-center", sidebarCollapsed ? "lg:block" : "lg:hidden")}>
              <Box className="w-5 h-5 text-primary-foreground" />
            </div>

            {/* Collapse button - visible only on desktop */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={cn(
                "hidden lg:flex p-1 rounded-md hover:bg-accent transition-colors",
                sidebarCollapsed ? "lg:hidden" : ""
              )}
              title={sidebarCollapsed ? "Expandir menu" : "Colapsar menu"}
            >
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Expand button for collapsed state */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={cn(
                "hidden p-1 rounded-md hover:bg-accent transition-colors absolute right-2 top-4",
                sidebarCollapsed ? "lg:flex" : "lg:hidden"
              )}
              title="Expandir menu"
            >
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* Close button - visible only on mobile */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md hover:bg-accent"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Navigation */}
          <nav className={cn("flex-1 py-4 space-y-2 overflow-y-auto sidebar-scroll bg-white dark:bg-gray-900", sidebarCollapsed ? "lg:px-2" : "px-4")}
          style={{backgroundColor: 'hsl(var(--background))'}}>
            {menuItems.map((item) => (
              <div key={item.title}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors group',
                      isActive(item.href)
                        ? 'bg-accent text-accent-foreground'
                        : 'text-foreground hover:bg-accent hover:text-accent-foreground',
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
                        'text-foreground hover:bg-accent hover:text-accent-foreground',
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
                                ? 'bg-accent text-accent-foreground font-medium'
                                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
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
      <div className={cn("transition-all duration-300 min-h-screen bg-background", sidebarCollapsed ? "lg:pl-16" : "lg:pl-64")}>
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
                  Kaora
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
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-foreground">
                      {session?.user?.name || 'Usuário'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session?.user?.email || 'Administrador'}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>

                {/* User dropdown menu */}
                {userMenuOpen && (
                  <>
                    {/* Backdrop para fechar o menu */}
                    <div 
                      className="fixed inset-0 z-50"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    
                    {/* Menu dropdown */}
                    <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-[60] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700" style={{backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))'}}>
                      <div className="py-2 bg-white dark:bg-gray-900 rounded-lg" style={{backgroundColor: 'hsl(var(--background))'}}>
                        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700" style={{backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))'}}>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100" style={{color: 'hsl(var(--foreground))'}}>
                            {session?.user?.name || 'Usuário'}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400" style={{color: 'hsl(var(--muted-foreground))'}}>
                            {session?.user?.email || 'user@example.com'}
                          </p>
                        </div>
                        
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          style={{backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))'}}
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sair
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 bg-background text-foreground">
          {children}
        </main>
      </div>
    </div>
  )
}
