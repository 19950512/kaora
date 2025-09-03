import { getContainer, UpdateUser, DeleteUser } from '@kaora/application';
import { NextResponse } from 'next/server';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await req.json();
    const container = getContainer();
    const updateUser = container.get<UpdateUser>('UpdateUser');
    await updateUser.execute(id, body);
    return NextResponse.json({ message: 'Usuário atualizado com sucesso' });
  } catch (error: any) {
    console.error(`Erro ao atualizar usuário ${params.id}:`, error);
    return NextResponse.json({ message: error.message || 'Erro interno do servidor' }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id } = params;
    const container = getContainer();
    const deleteUser = container.get<DeleteUser>('DeleteUser');
    await deleteUser.execute(id);
    return NextResponse.json({ message: 'Usuário deletado com sucesso' });
  } catch (error: any) {
    console.error(`Erro ao deletar usuário ${params.id}:`, error);
    return NextResponse.json({ message: error.message || 'Erro interno do servidor' }, { status: 400 });
  }
}
