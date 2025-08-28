'use client'

import { useState } from 'react'
import LayoutWithSidebar from '@/components/layout-with-sidebar'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useAuditLogs } from '@/hooks/useAuditLogs'
import { useAuditContexts } from '@/hooks/useAuditContexts'
import { useBusinessUsers } from '@/hooks/useBusinessUsers'

export default function AuditoriasPage() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    context: '',
    userId: '',
    startDate: '',
    endDate: ''
  })

  const { data: auditLogs, pagination, loading, error, refetch } = useAuditLogs(filters)
  const { contexts, loading: contextsLoading } = useAuditContexts()
  const { users, loading: usersLoading } = useBusinessUsers()

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      context: '',
      userId: '',
      startDate: '',
      endDate: ''
    })
  }

  const getContextColor = (context: string) => {
    const colors = [
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400',
      'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400',
      'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400',
      'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    ]

    // Use hash do contexto para escolher cor consistentemente
    let hash = 0
    for (let i = 0; i < context.length; i++) {
      hash = context.charCodeAt(i) + ((hash << 5) - hash)
    }

    return colors[Math.abs(hash) % colors.length]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  return (
    <ProtectedRoute>
      <LayoutWithSidebar>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Auditoria</h1>
            <p className="text-muted-foreground">
              Gerencie todas as auditorias realizadas no sistema
            </p>
          </div>

          {/* Filters */}
          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-card-foreground">Filtros</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Contexto</label>
                <select
                  value={filters.context}
                  onChange={(e) => handleFilterChange('context', e.target.value)}
                  className="w-full p-2 border border-input bg-background text-foreground rounded-md focus:ring-2 focus:ring-ring focus:border-transparent"
                  disabled={contextsLoading}
                >
                  <option value="">Todos os contextos</option>
                  {contexts.map((context) => (
                    <option key={context} value={context}>
                      {context.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Usuário</label>
                <select
                  value={filters.userId}
                  onChange={(e) => handleFilterChange('userId', e.target.value)}
                  className="w-full p-2 border border-input bg-background text-foreground rounded-md focus:ring-2 focus:ring-ring focus:border-transparent"
                  disabled={usersLoading}
                >
                  <option value="">Todos os usuários</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Data Inicial</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full p-2 border border-input bg-background text-foreground rounded-md focus:ring-2 focus:ring-ring focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Data Final</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full p-2 border border-input bg-background text-foreground rounded-md focus:ring-2 focus:ring-ring focus:border-transparent"
                />
              </div>

              <div className="flex items-end gap-2">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                >
                  Limpar Filtros
                </button>
                <button
                  onClick={() => refetch()}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Buscar
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-card-foreground">Registros de Auditoria</h2>
              {pagination && (
                <p className="text-sm text-muted-foreground">
                  Mostrando {auditLogs.length} de {pagination.total} registros
                </p>
              )}
            </div>

            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Carregando...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-8">
                <p className="text-destructive">{error}</p>
                <button
                  onClick={() => refetch()}
                  className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Tentar Novamente
                </button>
              </div>
            )}

            {!loading && !error && auditLogs.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhum registro encontrado</p>
              </div>
            )}

            {!loading && !error && auditLogs.length > 0 && (
              <div className="space-y-4">
                {auditLogs.map((log) => (
                  <div key={log.id} className="border border-border rounded-lg p-4 space-y-3 bg-card">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getContextColor(log.context)}`}>
                          {log.context.replace('_', ' ')}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(log.timestamp)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-foreground">Usuário:</span>
                      <span className="text-foreground">
                        {log.user ? `${log.user.name} (${log.user.email})` : 'Usuário não encontrado'}
                      </span>
                    </div>

                    {log.details && (
                      <div className="text-sm">
                        <strong className="text-foreground">Detalhes:</strong> <span className="text-muted-foreground">{log.details}</span>
                      </div>
                    )}

                    {log.ipAddress && (
                      <div className="text-sm">
                        <strong className="text-foreground">IP:</strong> <span className="text-muted-foreground">{log.ipAddress}</span>
                      </div>
                    )}

                    {log.userAgent && (
                      <div className="text-sm">
                        <strong className="text-foreground">User-Agent:</strong> <span className="text-muted-foreground">{log.userAgent}</span>
                      </div>
                    )}

                    {log.updatedFields && (
                      <div className="text-sm">
                        <strong className="text-foreground">Campos Alterados:</strong>
                        <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto text-muted-foreground">
                          {log.updatedFields}
                        </pre>
                      </div>
                    )}

                    {log.additionalData && (
                      <div className="text-sm">
                        <strong className="text-foreground">Dados Adicionais:</strong>
                        <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto text-muted-foreground">
                          {JSON.stringify(log.additionalData, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>

                <span className="text-sm text-muted-foreground">
                  Página {pagination.page} de {pagination.pages}
                </span>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Próxima
                </button>
              </div>
            )}
          </div>
        </div>
      </LayoutWithSidebar>
    </ProtectedRoute>
  )
}