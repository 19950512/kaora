import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { getContainer, TOKENS, BusinessApplicationService } from '@kaora/application';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        error: 'Usuário não autenticado.' 
      }, { status: 401 });
    }

    // Verificar se o conteúdo é multipart/form-data
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('multipart/form-data')) {
      return NextResponse.json({ 
        error: 'Content-Type deve ser multipart/form-data.' 
      }, { status: 400 });
    }

    // Obter dados do formulário
    const formData = await request.formData();
    const file = formData.get('logo') as File;
    const businessId = formData.get('businessId') as string;

    if (!file) {
      return NextResponse.json({ 
        error: 'Arquivo de logo é obrigatório.' 
      }, { status: 400 });
    }

    if (!businessId) {
      return NextResponse.json({ 
        error: 'ID da empresa é obrigatório.' 
      }, { status: 400 });
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Tipo de arquivo não suportado. Use JPEG, PNG, WebP ou SVG.' 
      }, { status: 400 });
    }

    // Validar tamanho do arquivo (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'Arquivo muito grande. Máximo 5MB.' 
      }, { status: 400 });
    }

    try {
      // Converter arquivo para buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);
      
      // Obter BusinessApplicationService do container
      const container = getContainer();
      const businessAppService = container.get<InstanceType<typeof BusinessApplicationService>>(TOKENS.BUSINESS_APP_SERVICE);

      // Fazer upload usando o serviço de aplicação
      const result = await businessAppService.uploadLogo({
        businessId,
        file: {
          name: file.name,
          size: file.size,
          type: file.type,
          buffer
        }
      });

      console.log('✅ [UPLOAD LOGO] Logo uploaded successfully:', { businessId, logoUrl: result.logoUrl });

      return NextResponse.json({
        success: result.success,
        logoUrl: result.logoUrl,
        message: result.message
      });

    } catch (uploadError: any) {
      // Fallback para erro de configuração do R2 (silencioso)
      if (uploadError.message?.includes('R2 configuration missing')) {
        console.log('ℹ️ R2 não configurado - usando modo demonstração');
        
        const timestamp = Date.now();
        const extension = file.name.split('.').pop();
        const fileName = `logos/${businessId}/${timestamp}.${extension}`;
        const fallbackUrl = `https://example.r2.cloudflarestorage.com/kaora/${fileName}`;
        
        return NextResponse.json({
          success: true,
          logoUrl: fallbackUrl,
          message: 'Logo enviado com sucesso! (Modo demonstração)'
        });
      }
      
      // Para outros erros, logar como erro
      console.error('❌ Erro ao fazer upload da logo:', uploadError);
      return NextResponse.json({ 
        error: uploadError?.message || 'Erro ao fazer upload da logo.' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Erro no endpoint upload logo:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor.' 
    }, { status: 500 });
  }
}

// Configuração para permitir upload de arquivos
export const config = {
  api: {
    bodyParser: false,
  },
};
