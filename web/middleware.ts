import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

// Lista de rotas públicas que não precisam de autenticação
const PUBLIC_ROUTES = [
  '/auth',
  '/auth/login',
  '/auth/create',
  '/auth/recovery',
  '/api/auth',
  '/favicon.ico',
  '/_next',
  '/globals.css'
]

// Lista de rotas que redirecionam usuários autenticados
const AUTH_REDIRECT_ROUTES = [
  '/auth/login',
  '/auth/create',
  '/auth/recovery'
]

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    console.log('🔐 [MIDDLEWARE] Verificando rota:', pathname, 'Token:', !!token)

    // Redirecionar /auth para /auth/login
    if (pathname === '/auth') {
      console.log('🔀 [MIDDLEWARE] Redirecionando /auth para /auth/login')
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }

    // Se usuário está autenticado e tenta acessar páginas de auth, redirecionar para home
    if (token && AUTH_REDIRECT_ROUTES.some(route => pathname.startsWith(route))) {
      console.log('✅ [MIDDLEWARE] Usuário autenticado tentando acessar auth, redirecionando para /')
      return NextResponse.redirect(new URL('/', req.url))
    }

    // Se usuário não está autenticado e tenta acessar rota privada
    if (!token && !PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
      console.log('❌ [MIDDLEWARE] Usuário não autenticado tentando acessar rota privada:', pathname)
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }

    // Permitir acesso
    console.log('✅ [MIDDLEWARE] Acesso permitido para:', pathname)
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Sempre permitir rotas públicas
        if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
          return true
        }

        // Para rotas privadas, verificar se tem token
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}
