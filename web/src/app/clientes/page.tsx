'use client'

import LayoutWithSidebar from '@/components/layout-with-sidebar'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { ClientesList } from '@/components/clientes/clientes-list'

export default function ClientesPage() {
  return (
    <ProtectedRoute>
      <LayoutWithSidebar>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
            <p className="text-muted-foreground">
              Gerencie todos os clientes cadastrados no sistema
            </p>
          </div>

          <ClientesList />
        </div>
      </LayoutWithSidebar>
    </ProtectedRoute>
  )
}
