'use client'

import { useState } from 'react'
import { Search, Filter, Plus, Eye, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { Cliente, Natureza, OrigemCadastro } from '@/types/cliente'

// Mock data - em produção viria do banco
const mockClientes: Cliente[] = []

interface Filtros {
  busca: string
  natureza: Natureza | 'TODOS'
  origem: OrigemCadastro | 'TODOS'
}

export function ClientesList() {
  const [clientes] = useState<Cliente[]>(mockClientes)
  const [filtros, setFiltros] = useState<Filtros>({
    busca: '',
    natureza: 'TODOS',
    origem: 'TODOS'
  })
  const [showFiltros, setShowFiltros] = useState(false)

  const clientesFiltrados = clientes.filter(cliente => {
    const matchBusca = cliente.nomeCompleto.toLowerCase().includes(filtros.busca.toLowerCase()) ||
                      cliente.documento.includes(filtros.busca)
    
    const matchNatureza = filtros.natureza === 'TODOS' || cliente.natureza === filtros.natureza
    const matchOrigem = filtros.origem === 'TODOS' || cliente.origemCadastro === filtros.origem

    return matchBusca && matchNatureza && matchOrigem
  })

  const formatarDocumento = (documento: string, natureza: Natureza) => {
    if (natureza === 'FISICA') {
      // CPF: 000.000.000-00
      return documento.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    } else {
      // CNPJ: 00.000.000/0000-00
      return documento.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    }
  }

  const formatarNatureza = (natureza: Natureza) => {
    return natureza === 'FISICA' ? 'Pessoa Física' : 'Pessoa Jurídica'
  }

  const formatarOrigem = (origem: OrigemCadastro) => {
    const origens = {
      WEB: 'Web',
      APP: 'App',
      PRESENCIAL: 'Presencial',
      TELEFONE: 'Telefone',
      EMAIL: 'E-mail',
      INDICACAO: 'Indicação'
    }
    return origens[origem]
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho com ações */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-1 items-center space-x-4">
          {/* Busca */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nome ou documento..."
              className="block w-full pl-10 pr-3 py-2 border border-input bg-background rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              value={filtros.busca}
              onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
            />
          </div>

          {/* Botão de filtros */}
          <button
            onClick={() => setShowFiltros(!showFiltros)}
            className="inline-flex items-center px-3 py-2 border border-input bg-background rounded-md text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </button>
        </div>

        {/* Botão novo cliente */}
        <Link
          href="/clientes/novo"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Link>
      </div>

      {/* Painel de filtros */}
      {showFiltros && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-medium text-foreground mb-4">Filtros</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Natureza
              </label>
              <select
                value={filtros.natureza}
                onChange={(e) => setFiltros({ ...filtros, natureza: e.target.value as Natureza | 'TODOS' })}
                className="block w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                <option value="TODOS">Todos</option>
                <option value="FISICA">Pessoa Física</option>
                <option value="JURIDICA">Pessoa Jurídica</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Origem do Cadastro
              </label>
              <select
                value={filtros.origem}
                onChange={(e) => setFiltros({ ...filtros, origem: e.target.value as OrigemCadastro | 'TODOS' })}
                className="block w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                <option value="TODOS">Todos</option>
                <option value="WEB">Web</option>
                <option value="APP">App</option>
                <option value="PRESENCIAL">Presencial</option>
                <option value="TELEFONE">Telefone</option>
                <option value="EMAIL">E-mail</option>
                <option value="INDICACAO">Indicação</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFiltros({ busca: '', natureza: 'TODOS', origem: 'TODOS' })}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Limpar filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de clientes */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {clientesFiltrados.length === 0 ? (
          <div className="text-center py-12">
            {clientes.length === 0 ? (
              <div>
                <div className="mx-auto h-12 w-12 text-muted-foreground">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                    />
                  </svg>
                </div>
                <h3 className="mt-2 text-sm font-medium text-foreground">Nenhum cliente cadastrado</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Comece criando um novo cliente.
                </p>
                <div className="mt-6">
                  <Link
                    href="/clientes/novo"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Cliente
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="mt-2 text-sm font-medium text-foreground">Nenhum cliente encontrado</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tente ajustar os filtros ou termo de busca.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Documento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Natureza
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Origem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Cadastro
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {clientesFiltrados.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {cliente.nomeCompleto}
                        </div>
                        {cliente.profissao && (
                          <div className="text-sm text-muted-foreground">
                            {cliente.profissao}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {formatarDocumento(cliente.documento, cliente.natureza)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                        {formatarNatureza(cliente.natureza)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {formatarOrigem(cliente.origemCadastro)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(cliente.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/clientes/${cliente.id}`}
                          className="text-primary hover:text-primary/80"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Visualizar</span>
                        </Link>
                        <Link
                          href={`/clientes/${cliente.id}/editar`}
                          className="text-primary hover:text-primary/80"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Link>
                        <button
                          className="text-destructive hover:text-destructive/80"
                          onClick={() => {
                            // TODO: Implementar exclusão
                            console.log('Excluir cliente:', cliente.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Excluir</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
