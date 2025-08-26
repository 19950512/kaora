import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      businessName, 
      businessDocument, 
      businessPhone,
      responsibleName,
      responsibleEmail
    } = body;

    // Validação básica
    if (!businessName || !businessDocument || !responsibleName || !responsibleEmail) {
      return NextResponse.json({ 
        error: 'Nome da empresa, documento, nome do responsável e email são obrigatórios.' 
      }, { status: 400 });
    }

    // Chamar a API de criação padrão
    const createResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/api/business/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        businessName,
        businessDocument,
        businessPhone: businessPhone || '',
        responsibleName,
        responsibleEmail,
        responsibleDocument: businessDocument, // Usar o documento da empresa como padrão
        responsiblePassword: `google_oauth_${Date.now()}`, // Senha temporária para OAuth
      }),
    });

    const result = await createResponse.json();

    if (!createResponse.ok) {
      return NextResponse.json({ error: result.error }, { status: createResponse.status });
    }

    console.log('✅ [GOOGLE OAUTH] Empresa criada via Google OAuth!', result);

    return NextResponse.json({
      ...result,
      source: 'GOOGLE_OAUTH_REGISTRATION',
      message: 'Empresa registrada com sucesso via Google!'
    });

  } catch (error) {
    console.error('❌ Erro no endpoint Google OAuth:', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}
