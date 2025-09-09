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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Edit, Trash2, AlertTriangle } from 'lucide-react';
import RoleFormModal from '@/components/roles/role-form-modal';
import { toast } from 'sonner';

interface RoleData {
  id: string;
  name: string;
  active: boolean;
  color: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/roles');
      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      }
    } catch (error) {
      console.error('Erro ao buscar cargos:', error);
      toast.error('Erro ao carregar cargos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleAddRole = () => {
    setEditingRole(null);
    setIsModalOpen(true);
  };

  const handleEditRole = (role: RoleData) => {
    setEditingRole(role);
    setIsModalOpen(true);
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        toast.success('Cargo excluído com sucesso!');
        await fetchRoles();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Erro ao excluir cargo');
      }
    } catch (error) {
      console.error('Erro ao excluir cargo:', error);
      toast.error('Erro ao excluir cargo');
    }
  };

  const handleSaveRole = async (roleData: any) => {
    try {
      const url = editingRole ? `/api/roles/${editingRole.id}` : '/api/roles';
      const method = editingRole ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roleData),
      });

      if (response.ok) {
        toast.success(editingRole ? 'Cargo atualizado com sucesso!' : 'Cargo criado com sucesso!');
        await fetchRoles();
        setIsModalOpen(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao salvar cargo');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar cargo');
      throw error; // Re-throw para que o modal não feche
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <LayoutWithSidebar>
          <div className="p-6">
            <div className="flex justify-center items-center h-32">
              <p className="text-muted-foreground">Carregando cargos...</p>
            </div>
          </div>
        </LayoutWithSidebar>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <LayoutWithSidebar>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Gerenciamento de Cargos</h1>
            <p className="text-muted-foreground mt-1">
            Gerencie todos os cargos cadastrados no sistema.
            </p>
        </div>
        <Button onClick={handleAddRole} className="w-full sm:w-auto">
            <span className="sm:hidden">+ Novo Cargo</span>
            <span className="hidden sm:inline">Adicionar Cargo</span>
        </Button>
        </div>

        <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="min-w-[120px]">Nome</TableHead>
                <TableHead className="min-w-[100px]">Cor</TableHead>
                <TableHead className="min-w-[80px]">Ativo</TableHead>
                <TableHead className="text-right min-w-[160px]">Ações</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {roles.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center gap-2">
                        <p className="text-muted-foreground">Nenhum cargo encontrado</p>
                        <Button onClick={handleAddRole} size="sm" variant="outline">
                        Adicionar primeiro cargo
                        </Button>
                    </div>
                    </TableCell>
                </TableRow>
                ) : (
                roles.map((role) => (
                    <TableRow key={role.id}>
                    <TableCell className="font-medium">
                        {role.name}
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                        <div 
                            className="w-4 h-4 rounded-full border flex-shrink-0"
                            style={{ backgroundColor: role.color }}
                        />
                        <span className="text-sm text-muted-foreground hidden sm:inline">
                            {role.color}
                        </span>
                        </div>
                    </TableCell>
                    <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                        role.active 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        }`}>
                        {role.active ? 'Sim' : 'Não'}
                        </span>
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="flex justify-end gap-1 sm:gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditRole(role)}
                            className="flex items-center gap-1 px-2 sm:px-3"
                        >
                            <Edit className="h-4 w-4" />
                            <span className="hidden sm:inline">Editar</span>
                        </Button>
                        
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 hover:text-red-700 px-2 sm:px-3"
                            >
                                <Trash2 className="h-4 w-4" />
                                <span className="hidden sm:inline">Excluir</span>
                            </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="mx-4 max-w-lg">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                Confirmar exclusão
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                Tem certeza que deseja excluir o cargo <strong>{role.name}</strong>? 
                                Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                                <AlertDialogCancel className="w-full sm:w-auto">
                                Cancelar
                                </AlertDialogCancel>
                                <AlertDialogAction
                                onClick={() => handleDeleteRole(role.id)}
                                className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
                                >
                                Sim, excluir
                                </AlertDialogAction>
                            </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        </div>
                    </TableCell>
                    </TableRow>
                ))
                )}
            </TableBody>
            </Table>
        </div>
        </div>

        <RoleFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRole}
        role={editingRole}
        className="bg-card"
        />
      </LayoutWithSidebar>
    </ProtectedRoute>
  );
}
