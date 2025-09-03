import { getContainer, UserService, CreateUser } from '@kaora/application';
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
    // No mundo real, o businessId viria da sessão do usuário autenticado
    const fixedBusinessId = 'c7f27a39-232c-4f7a-b06f-27c923b3e025';
    await createUser.execute({ ...body, businessId: fixedBusinessId });
    return NextResponse.json({ message: 'Usuário criado com sucesso' }, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar usuário:', error);
    return NextResponse.json({ message: error.message || 'Erro interno do servidor' }, { status: 400 });
  }
}

