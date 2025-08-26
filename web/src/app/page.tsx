import LayoutWithSidebar from '@/components/layout-with-sidebar'
import { Users, Home, TrendingUp, DollarSign } from 'lucide-react'
import Link from 'next/link'

const stats = [
  {
    name: 'Total de Clientes',
    value: '127',
    icon: Users,
    change: '+12%',
    changeType: 'increase',
  },
  {
    name: 'Receita Mensal',
    value: 'R$ 89.240',
    icon: DollarSign,
    change: '+8%',
    changeType: 'increase',
  },
]

export default function Dashboard() {
  return (
    <LayoutWithSidebar>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do sistema de locação
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.name}
                className="relative overflow-hidden rounded-xl bg-card p-6 shadow-sm border border-border hover:shadow-md transition-shadow"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-muted-foreground">
                        {item.name}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-foreground">
                          {item.value}
                        </div>
                        <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                          {item.change}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Ações Rápidas</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/clientes/novo"
              className="group relative overflow-hidden rounded-xl bg-card p-6 shadow-sm border border-border hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
            >
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                    Cadastrar Cliente
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Adicionar novo cliente
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/clientes"
              className="group relative overflow-hidden rounded-xl bg-card p-6 shadow-sm border border-border hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
            >
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20 group-hover:bg-green-100 dark:group-hover:bg-green-900/30 transition-colors">
                  <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                    Gerenciar Clientes
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Visualizar e editar
                  </p>
                </div>
              </div>
            </Link>

            <div className="group relative overflow-hidden rounded-xl bg-card p-6 shadow-sm border border-border opacity-50">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">
                    Relatórios
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Em breve...
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-xl bg-card p-6 shadow-sm border border-border opacity-50">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800">
                  <TrendingUp className="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">
                    Analytics
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Em breve...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Atividade Recente</h2>
          <div className="rounded-xl bg-card border border-border p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">João Silva</span> foi cadastrado há 2 horas
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Contrato #1234</span> foi renovado há 4 horas
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Apartamento 102</span> foi atualizado há 6 horas
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutWithSidebar>
  )
}
