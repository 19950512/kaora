import LayoutWithSidebar from '@/components/layout-with-sidebar'
import { ClienteForm } from '@/components/clientes/cliente-form'

export default function NovoClientePage() {
  return (
    <LayoutWithSidebar>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Novo Cliente</h1>
          <p className="text-muted-foreground">
            Cadastre um novo cliente no sistema
          </p>
        </div>

        <ClienteForm />
      </div>
    </LayoutWithSidebar>
  )
}
