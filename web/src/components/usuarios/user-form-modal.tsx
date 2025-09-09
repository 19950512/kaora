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

interface UserData {
  id?: string;
  name?: string;
  email?: string;
  document?: string;
  phone?: string;
  active?: boolean;
}

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: UserData) => void;
  user: any;
  className?: string;
}

export default function UserFormModal({ isOpen, onClose, onSave, user, className }: UserFormModalProps) {
  const [formData, setFormData] = useState<UserData>({
    name: '',
    email: '',
    document: '',
    phone: '',
    active: true,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: typeof user.name === 'string' ? user.name : user.name?.toString() || '',
        email: typeof user.email === 'string' ? user.email : user.email?.toString() || '',
        document: typeof user.document === 'string' ? user.document : user.document?.toString() || '',
        phone: typeof user.phone === 'string' ? user.phone : user.phone?.toString() || '',
        active: user.active ?? true,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        document: '',
        phone: '',
        active: true,
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: UserData) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev: UserData) => ({ ...prev, active: checked }));
  };

  const handleSubmit = async () => {
    try {
      await onSave(formData);
      // Não fechar aqui, deixar o onSave cuidar disso
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar usuário');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`sm:max-w-[425px] border border-border shadow-xl ${className ?? ''}`}
      >
        <DialogHeader>
          <DialogTitle>
            {user && user.id ? 'Editar Usuário' : 'Novo Usuário'}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nome
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="document" className="text-right">
              CPF/CNPJ
            </Label>
            <Input
              id="document"
              name="document"
              value={formData.document}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              Telefone
            </Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="active" className="text-right">
              Ativo
            </Label>
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={handleSwitchChange}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSubmit}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
