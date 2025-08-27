import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json({ 
        error: 'ID da empresa é obrigatório.' 
      }, { status: 400 });
    }

    try {
      const { getContainer, TOKENS, BusinessApplicationService } = await import('@kaora/application');
      const container = getContainer();
      
      const businessService = container.get<InstanceType<typeof BusinessApplicationService>>(TOKENS.BUSINESS_APP_SERVICE);
      
      // Buscar informações completas da empresa
      const business = await businessService.getBusinessById(businessId);

      console.log('✅ [GET BUSINESS] Informações da empresa obtidas:', { businessId, business });

      return NextResponse.json({
        id: business.id,
        name: business.name,
        email: business.email,
        document: business.document,
        phone: business.phone,
        whatsapp: business.whatsapp,
        logoUrl: business.logoUrl,
        createdAt: business.createdAt,
        updatedAt: business.updatedAt
      });

    } catch (err: any) {
      console.error('❌ Erro ao buscar empresa:', err);
      
      if (err?.message?.includes('not found') || err?.message?.includes('não encontrada')) {
        return NextResponse.json({ 
          error: 'Empresa não encontrada.' 
        }, { status: 404 });
      }
      
      return NextResponse.json({ 
        error: err?.message || 'Erro ao buscar informações da empresa.' 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ Erro no endpoint get business:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor.' 
    }, { status: 500 });
  }
}
