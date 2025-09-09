import { getContainer, UserService, CreateUser, BusinessApplicationService, TOKENS } from '@kaora/application';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const container = getContainer();
    const userService = container.get<UserService>('UserService');
    const users = await userService.getAllUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const container = getContainer();
    const createUser = container.get<CreateUser>('CreateUser');
    
    // Usar o businessId do exemplo
    const businessId = '969539a2-65b8-4480-a42b-afdff2b63324';
    
    // Tentar criar o usuário
    try {
      await createUser.execute({ ...body, businessId });
    } catch (userError: any) {
      // Se falhar por causa do business, tentar criar o business primeiro
      if (userError.message?.includes('Foreign key constraint')) {
        console.log('Business não encontrado, criando business padrão...');
        try {
          const businessService = container.get<InstanceType<typeof BusinessApplicationService>>(TOKENS.BUSINESS_APP_SERVICE);
          await businessService.createBusiness({
            businessName: 'Slipksoftware',
            responsibleName: 'Matheus Silva',
            responsibleEmail: 'matheus@objetivasoftware.com.br',
            responsiblePassword: 'admin123',
            responsibleDocument: '84167670097',
            businessDocument: '84167670097',
            businessPhone: '11999999999',
            responsiblePhone: '11999999999'
          });
          console.log('✅ Business padrão criado');
          
          // Tentar criar o usuário novamente
          await createUser.execute({ ...body, businessId });
        } catch (businessError: any) {
          console.error('❌ Erro ao criar business:', businessError);
          throw userError; // Re-throw o erro original
        }
      } else {
        throw userError;
      }
    }
    
    return NextResponse.json({ message: 'Usuário criado com sucesso' }, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar usuário:', error);
    return NextResponse.json({ message: error.message || 'Erro interno do servidor' }, { status: 400 });
  }
}
