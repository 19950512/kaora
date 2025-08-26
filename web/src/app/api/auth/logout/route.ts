import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('🚪 [LOGOUT_API] Requisição de logout recebida');

    // Obter a sessão atual
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      console.log('⚠️ [LOGOUT_API] Nenhuma sessão ativa encontrada');
      return NextResponse.json(
        { success: false, error: 'Nenhuma sessão ativa' },
        { status: 401 }
      );
    }

    const userId = session.user.id || session.user.email;
    console.log('🔍 [LOGOUT_API] Processando logout para usuário:', userId);

    // Registrar o logout no banco de dados (opcional)
    try {
      // Aqui você pode adicionar lógica adicional de logout
      // Como invalidar tokens, registrar auditoria, etc.
      console.log('✅ [LOGOUT_API] Logout registrado para usuário:', userId);
    } catch (serviceError) {
      console.warn('⚠️ [LOGOUT_API] Erro ao registrar logout:', serviceError);
      // Continuar mesmo se o registro falhar
    }

    // Resposta de sucesso
    console.log('✅ [LOGOUT_API] Logout processado com sucesso');
    return NextResponse.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });

  } catch (error: any) {
    console.error('❌ [LOGOUT_API] Erro no logout:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor durante logout' 
      },
      { status: 500 }
    );
  }
}

// Método GET para verificar status de logout
export async function GET() {
  return NextResponse.json({
    message: 'Endpoint de logout ativo',
    method: 'POST'
  });
}
