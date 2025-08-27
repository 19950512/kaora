import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ 
        error: 'Email é obrigatório.' 
      }, { status: 400 });
    }

    try {
      const { getContainer, TOKENS, BusinessApplicationService } = await import('@kaora/application');
      const container = getContainer();
      
      const businessService = container.get<InstanceType<typeof BusinessApplicationService>>(TOKENS.BUSINESS_APP_SERVICE);
      
      // Verificar se existe uma empresa com este email de responsável
      const result = await businessService.checkUserBusiness(email);

      console.log('✅ [CHECK USER BUSINESS] Verificação realizada:', { email, result });

      return NextResponse.json({
        hasCompany: result.hasCompany,
        companyId: result.companyId,
        companyName: result.companyName
      });

    } catch (err: any) {
      console.error('❌ Erro ao verificar empresa do usuário:', err);
      
      // Se não encontrar empresa, retornar hasCompany: false
      if (err?.message?.includes('not found') || err?.message?.includes('não encontrada')) {
        return NextResponse.json({
          hasCompany: false,
          companyId: null,
          companyName: null
        });
      }
      
      return NextResponse.json({ 
        error: err?.message || 'Erro ao verificar empresa do usuário.' 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ Erro no endpoint check-user-business:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor.' 
    }, { status: 500 });
  }
}
