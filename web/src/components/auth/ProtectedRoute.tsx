'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  redirectTo?: string
  loadingComponent?: ReactNode
}

export default function ProtectedRoute({ 
  children, 
  redirectTo = '/auth/login',
  loadingComponent
}: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Ainda carregando

    if (!session) {
      console.log('🔐 [PROTECTED_ROUTE] Usuário não autenticado, redirecionando para:', redirectTo)
      router.push(redirectTo)
      return
    }

    console.log('✅ [PROTECTED_ROUTE] Usuário autenticado, permitindo acesso')
  }, [session, status, router, redirectTo])

  // Mostrar loading enquanto verifica a sessão
  if (status === 'loading') {
    return loadingComponent || (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // Se não tem sessão, não renderizar nada (redirecionamento em curso)
  if (!session) {
    return null
  }

  // Renderizar o conteúdo protegido
  return <>{children}</>
}

// Hook personalizado para verificar autenticação
export function useAuth() {
  const { data: session, status } = useSession()
  
  return {
    user: session?.user,
    isAuthenticated: !!session,
    isLoading: status === 'loading',
    session
  }
}

// Componente para rotas que devem redirecionar usuários autenticados
export function PublicRoute({ 
  children, 
  redirectTo = '/',
  loadingComponent
}: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Ainda carregando

    if (session) {
      console.log('🔐 [PUBLIC_ROUTE] Usuário já autenticado, redirecionando para:', redirectTo)
      router.push(redirectTo)
      return
    }
  }, [session, status, router, redirectTo])

  // Mostrar loading enquanto verifica a sessão
  if (status === 'loading') {
    return loadingComponent || (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  // Se tem sessão, não renderizar nada (redirecionamento em curso)
  if (session) {
    return null
  }

  // Renderizar o conteúdo público
  return <>{children}</>
}
