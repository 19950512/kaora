import { getContainer, UserService, CreateUser, BusinessApplicationService, TOKENS } from '@kaora/application';
import { NextResponse } from 'next/server';
import { getRequestContext } from '@/lib/auth-server'

export async function GET(req: Request) {
  try {
    const ctx = await getRequestContext(req)
    const container = getContainer();
    const userService = container.get<UserService>('UserService');
    const users = await userService.getAllUsers();

    // Filtra por tenant e retorna objetos simples serializáveis
    const filtered = users
      .filter((u: any) => {
        try {
          return (u.businessId?.toString?.() ?? u.businessId) === ctx.businessId
        } catch {
          return false
        }
      })
      .map((u: any) => (typeof u.toObject === 'function' ? u.toObject() : u))

    return NextResponse.json(filtered);
  } catch (error: any) {
    const status = error?.status || 500
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json({ message: error.message || 'Erro interno do servidor' }, { status });
  }
}

export async function POST(req: Request) {
  try {
  const body = await req.json();
  const container = getContainer();
  const createUser = container.get<CreateUser>('CreateUser');

  // Contexto autenticado (obtém businessId e userId da sessão)
  const ctx = await getRequestContext(req)

  // Executa criação do usuário no tenant correto
  await createUser.execute({ ...body, businessId: ctx.businessId });

  return NextResponse.json({ message: 'Usuário criado com sucesso' }, { status: 201 });
  } catch (error: any) {
  const status = error?.status || 400
  console.error('Erro ao criar usuário:', error);
  return NextResponse.json({ message: error.message || 'Erro interno do servidor' }, { status });
  }
}
