'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface RoleData {
  id?: string;
  name?: string;
  active?: boolean;
  color?: string;
}

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (role: RoleData) => void;
  role: RoleData | null;
  className?: string;
}

export default function RoleFormModal({ isOpen, onClose, onSave, role, className }: RoleFormModalProps) {
  const [formData, setFormData] = useState<RoleData>({
    name: '',
    active: true,
    color: '#3b82f6',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name || '',
        active: role.active ?? true,
        color: role.color || '#3b82f6',
      });
    } else {
      setFormData({
        name: '',
        active: true,
        color: '#3b82f6',
      });
    }
  }, [role, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    if (!formData.color?.trim()) {
      toast.error('Cor é obrigatória');
      return;
    }

    setIsLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      // Erro já tratado no componente pai
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-[425px] mx-4 ${className || ''}`}>
        <DialogHeader>
          <DialogTitle>
            {role ? 'Editar Cargo' : 'Novo Cargo'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Digite o nome do cargo"
                disabled={isLoading}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="color">Cor</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="color"
                  type="color"
                  value={formData.color || '#3b82f6'}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  disabled={isLoading}
                  className="w-16 h-10 p-1 flex-shrink-0"
                  required
                />
                <Input
                  type="text"
                  value={formData.color || '#3b82f6'}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  disabled={isLoading}
                  placeholder="#3b82f6"
                  pattern="^#[0-9A-Fa-f]{6}$"
                  className="flex-1 min-w-0"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.active ?? true}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
                disabled={isLoading}
              />
              <Label htmlFor="active">Ativo</Label>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
