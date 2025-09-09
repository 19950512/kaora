import { getContainer, CreateRole, GetRoles } from '@kaora/application';
import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth-context';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const authContext = await getAuthContext(req);
    const container = getContainer();
    const createRole = container.get<CreateRole>('CreateRole');
    await createRole.execute(body, authContext);
    return NextResponse.json({ message: 'Role criado com sucesso' });
  } catch (error: any) {
    console.error('Erro ao criar role:', error);
    return NextResponse.json({ message: error.message || 'Erro interno do servidor' }, { status: 400 });
  }
}

export async function GET(req: Request) {
  try {
    const authContext = await getAuthContext(req);
    const container = getContainer();
    const getRoles = container.get<GetRoles>('GetRoles');
    const roles = await getRoles.execute(authContext.businessId);
    return NextResponse.json(roles);
  } catch (error: any) {
    console.error('Erro ao buscar roles:', error);
    return NextResponse.json({ message: error.message || 'Erro interno do servidor' }, { status: 500 });
  }
}
