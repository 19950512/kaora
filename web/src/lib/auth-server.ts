import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

export interface RequestContext {
  userId: string
  businessId: string
  ipAddress?: string
  userAgent?: string
}

// Extrai contexto da requisição (sessão + headers). Lança erro 401/400 quando faltar info essencial.
export async function getRequestContext(req: Request): Promise<RequestContext> {
  const session: any = await getServerSession(authOptions as any)

  if (!session?.user) {
    const e: any = new Error('Usuário não autenticado')
    e.status = 401
    throw e
  }

  // Em nossa sessão, o companyId é preenchido no callback de session em lib/auth.ts
  let businessId = session.user?.companyId as string | undefined
  const userId = session.user?.id as string | undefined

  // Fallback: tentar resolver businessId pelo email do usuário
  if (!businessId && session.user?.email) {
    try {
      const { getContainer, TOKENS } = await import('@kaora/application')
      const container = getContainer()
      const businessService = container.get<any>(TOKENS.BUSINESS_APP_SERVICE)
      const result = await businessService.checkUserBusiness(session.user.email)
      if (result?.companyId) {
        businessId = result.companyId
      }
    } catch (err) {
      // Apenas loga; o tratamento continua abaixo
      console.warn('[auth-server] Falha ao resolver businessId via fallback:', err)
    }
  }

  if (!businessId) {
    const e: any = new Error('Empresa não identificada na sessão')
    e.status = 400
    throw e
  }

  // Alguns provedores podem não fornecer um id; caso não exista, usamos o email como fallback identificador
  const resolvedUserId = userId || session.user?.email
  if (!resolvedUserId) {
    const e: any = new Error('Usuário inválido na sessão')
    e.status = 400
    throw e
  }

  const userAgent = req.headers.get('user-agent') || undefined
  const forwardedFor = req.headers.get('x-forwarded-for')
  const ipAddress = forwardedFor?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || undefined

  return {
    userId: resolvedUserId,
    businessId,
    ipAddress: ipAddress || undefined,
    userAgent,
  }
}
