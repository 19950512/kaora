import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
  const { businessName, responsibleName, responsibleEmail, responsiblePassword, responsibleDocument, businessDocument, businessPhone, responsiblePhone } = body;

    // Validação básica
    if (!businessName || !responsibleName || !responsibleEmail || !responsiblePassword || !responsibleDocument) {
      return NextResponse.json({ 
        error: 'Preencha todos os campos obrigatórios (incluindo documento do responsável).' 
      }, { status: 400 });
    }

    try {

      const { getContainer, TOKENS, BusinessApplicationService } = await import('@kaora/application');
      const container = getContainer();
      
      const businessService = container.get<InstanceType<typeof BusinessApplicationService>>(TOKENS.BUSINESS_APP_SERVICE);
      
      const result = await businessService.createBusiness({
        businessName,
        responsibleName,
        responsibleEmail,
        responsiblePassword,
        responsibleDocument,
        businessDocument,
        businessPhone,
        responsiblePhone
      });

      console.log('✅ [CLEAN ARCHITECTURE] Empresa criada via Application Service!', result);

      return NextResponse.json({
        ...result,
        source: 'CLEAN_ARCHITECTURE_WITH_DI'
      });

    } catch (err: any) {
      console.error('❌ Erro ao criar empresa:', err);
      let errorMsg = err?.message || 'Erro ao criar empresa.';
      // Garante que a mensagem amigável de duplicidade seja exibida
      if (typeof errorMsg === 'string' && errorMsg.includes('Unique constraint failed') && errorMsg.includes('document')) {
        errorMsg = 'Já existe uma empresa cadastrada com este documento.';
      }
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ Erro no endpoint:', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}