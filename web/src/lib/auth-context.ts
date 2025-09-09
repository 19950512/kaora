export interface AuthContext {
  userId: string;
  businessId: string;
  ipAddress?: string;
  userAgent?: string;
}

export async function getAuthContext(req: Request): Promise<AuthContext> {
  // TODO: Implementar autenticação real
  // Por enquanto, usar valores padrão para desenvolvimento
  // Em produção, isso virá do token JWT ou sessão
  
  const userAgent = req.headers.get('user-agent') || undefined;
  const forwardedFor = req.headers.get('x-forwarded-for');
  const ipAddress = forwardedFor?.split(',')[0] || req.headers.get('x-real-ip') || undefined;

  return {
    userId: '123e4567-e89b-12d3-a456-426614174001', // ID do usuário de teste criado
    businessId: '123e4567-e89b-12d3-a456-426614174000', // ID do business de teste criado
    ipAddress,
    userAgent
  };
}
