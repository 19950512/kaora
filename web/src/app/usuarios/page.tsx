'use client';

import { useState, useEffect } from 'react';
import LayoutWithSidebar from '@/components/layout-with-sidebar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import UserFormModal from '@/components/usuarios/user-form-modal';
import { toast } from 'sonner';

interface UserData {
  id: string | any;
  name: any;
  email: any;
  document: any;
  phone: any;
  active: boolean;
}

export default function UsuariosPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/usuarios');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: UserData) => {
    // Garantir que o ID seja sempre uma string válida
    const userId = (user.id && typeof user.id === 'string' && user.id !== '[object Object]') 
      ? user.id 
      : String(user.id || '');
    
    const simpleUser = {
      id: userId,
      name: user.name?.value || user.name?.toString?.() || user.name || '',
      email: user.email?.value || user.email?.toString?.() || user.email || '',
      document: user.document?.value || user.document?.toString?.() || user.document || '',
      phone: user.phone?.value || user.phone?.toString?.() || user.phone || '',
      active: Boolean(user.active),
    };
    setEditingUser(simpleUser);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        const id = (userId && typeof userId === 'string' && userId !== '[object Object]') 
          ? userId 
          : String(userId || '');
        const response = await fetch(`/api/usuarios/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          toast.success('Usuário excluído com sucesso!');
          await fetchUsers();
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || 'Erro ao excluir usuário');
        }
      } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        toast.error('Erro ao excluir usuário');
      }
    }
  };

  const handleSaveUser = async (userData: any) => {
    try {
      const userId = editingUser?.id && typeof editingUser.id === 'string' && editingUser.id !== '[object Object]'
        ? editingUser.id
        : String(editingUser?.id || '');
      const url = editingUser ? `/api/usuarios/${userId}` : '/api/usuarios';
      const method = editingUser ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        toast.success(editingUser ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!');
        await fetchUsers();
        setIsModalOpen(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao salvar usuário');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar usuário');
      throw error; // Re-throw para que o modal não feche
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <LayoutWithSidebar>
          <div className="p-6">
            <div className="flex justify-center items-center h-32">
              <p className="text-muted-foreground">Carregando usuários...</p>
            </div>
          </div>
        </LayoutWithSidebar>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <LayoutWithSidebar>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
              <p className="text-muted-foreground">
                Gerencie todos os usuários cadastrados no sistema.
              </p>
            </div>
            <Button onClick={handleAddUser}>
              Adicionar Usuário
            </Button>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Ativo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      Nenhum usuário encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user, index) => {
                    // Garantir ID único e válido
                    const userId = (user.id && typeof user.id === 'string' && user.id !== '[object Object]') 
                      ? user.id 
                      : `temp-${index}`;
                    
                    return (
                      <TableRow key={userId}>
                        <TableCell className="font-medium">
                          {user.name?.value || user.name?.toString?.() || user.name || ''}
                        </TableCell>
                        <TableCell>
                          {user.email?.value || user.email?.toString?.() || user.email || ''}
                        </TableCell>
                        <TableCell>
                          {user.document?.value || user.document?.toString?.() || user.document || ''}
                        </TableCell>
                        <TableCell>
                          {user.phone?.value || user.phone?.toString?.() || user.phone || ''}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.active 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          }`}>
                            {user.active ? 'Sim' : 'Não'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditUser(user)}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteUser(userId)}
                            >
                              Excluir
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <UserFormModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveUser}
            user={editingUser}
            className="bg-card"
          />
        </div>
      </LayoutWithSidebar>
    </ProtectedRoute>
  );
}
