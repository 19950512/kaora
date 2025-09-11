import { getContainer, UpdateRole, DeleteRole } from '@kaora/application';
import { NextResponse } from 'next/server';
import { getRequestContext } from '@/lib/auth-server';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PUT(req: Request, { params }: RouteParams) {
  let roleId = 'unknown';
  try {
    const { id } = await params;
    roleId = id;
    const body = await req.json();
  const authContext = await getRequestContext(req);
    const container = getContainer();
    const updateRole = container.get<UpdateRole>('UpdateRole');
    await updateRole.execute(id, body, authContext);
    return NextResponse.json({ message: 'Role atualizado com sucesso' });
  } catch (error: any) {
    console.error(`Erro ao atualizar role ${roleId}:`, error);
  return NextResponse.json({ message: error.message || 'Erro interno do servidor' }, { status: error.status || 400 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  let roleId = 'unknown';
  try {
    const { id } = await params;
    roleId = id;
  const authContext = await getRequestContext(req);
    const container = getContainer();
    const deleteRole = container.get<DeleteRole>('DeleteRole');
    await deleteRole.execute(id, authContext);
    return NextResponse.json({ message: 'Role deletado com sucesso' });
  } catch (error: any) {
    console.error(`Erro ao deletar role ${roleId}:`, error);
  return NextResponse.json({ message: error.message || 'Erro interno do servidor' }, { status: error.status || 400 });
  }
}
