import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { getContainer, TOKENS, BusinessApplicationService } from '@kaora/application';

export async function PUT(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        error: 'Usuário não autenticado.' 
      }, { status: 401 });
    }

    // Obter dados do body
    const body = await request.json();
    const {
      businessId,
      name,
      document,
      type,
      address,
      phone,
      website,
      description,
      email,
      whatsapp
    } = body;

    // Validações básicas
    if (!businessId) {
      return NextResponse.json({ 
        error: 'ID da empresa é obrigatório.' 
      }, { status: 400 });
    }

    if (!name || !document || !phone || !email) {
      return NextResponse.json({ 
        error: 'Nome, documento, telefone e email são obrigatórios.' 
      }, { status: 400 });
    }

    // Validar formato do documento (CNPJ ou CPF)
    const cleanDocument = document.replace(/\D/g, '');
    if (cleanDocument.length !== 11 && cleanDocument.length !== 14) {
      return NextResponse.json({ 
        error: 'Documento deve ter 11 dígitos (CPF) ou 14 dígitos (CNPJ).' 
      }, { status: 400 });
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        error: 'Email inválido.' 
      }, { status: 400 });
    }

    try {
      // Obter BusinessApplicationService do container
      const container = getContainer();
      const businessAppService = container.get<InstanceType<typeof BusinessApplicationService>>(TOKENS.BUSINESS_APP_SERVICE);

      // Atualizar empresa usando o serviço de aplicação
      const result = await businessAppService.updateBusiness({
        businessId,
        name: name.trim(),
        document: cleanDocument,
        type: type || null,
        address: address?.trim() || null,
        phone: phone.replace(/\D/g, ''),
        website: website?.trim() || null,
        description: description?.trim() || null,
        email: email.trim(),
        whatsapp: whatsapp ? whatsapp.replace(/\D/g, '') : null
      });

      console.log('✅ [UPDATE BUSINESS] Empresa atualizada:', {
        businessId,
        userEmail: session.user.email,
        changes: {
          name,
          document: cleanDocument,
          type,
          email,
          phone: phone.replace(/\D/g, ''),
          whatsapp: whatsapp ? whatsapp.replace(/\D/g, '') : null
        }
      });

      return NextResponse.json({
        success: true,
        business: result.business,
        message: result.message
      });

    } catch (updateError: any) {
      console.error('❌ Erro ao atualizar empresa:', updateError);
      return NextResponse.json({ 
        error: updateError.message || 'Erro interno ao atualizar empresa.' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Erro no endpoint update business:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor.' 
    }, { status: 500 });
  }
}

// Método OPTIONS para CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
