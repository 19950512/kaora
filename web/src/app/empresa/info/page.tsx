'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import LayoutWithSidebar from '@/components/layout-with-sidebar'
import { useUserBusiness } from '@/hooks/useUserBusiness'
import { LogoUpload } from '@/components/business/LogoUpload'
import type { Business } from '@/types/business'

import Link from 'next/link'
import { 
  Building2, 
  Mail, 
  Phone, 
  MessageSquare, 
  FileText, 
  Calendar,
  Edit,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'

function BusinessInfo({ businessId }: { businessId: string }) {
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!businessId) {
      setError('ID da empresa não fornecido')
      setLoading(false)
      return
    }

    const fetchBusiness = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/business/get?businessId=${businessId}`)
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Erro ao buscar informações da empresa')
        }

        const businessData = await response.json()
        setBusiness(businessData)
      } catch (err) {
        console.error('Erro ao buscar empresa:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    fetchBusiness()
  }, [businessId])

  if (loading) {
    return (
      <div className="space-y-6 bg-background text-foreground min-h-screen">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Informações da Empresa</h1>
          <p className="text-muted-foreground">
            Dados cadastrais e de contato
          </p>
        </div>

        {/* Loading */}
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Carregando informações da empresa...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 bg-background text-foreground min-h-screen">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Informações da Empresa</h1>
          <p className="text-muted-foreground">
            Dados cadastrais e de contato
          </p>
        </div>

        {/* Error Card */}
        <div className="max-w-2xl">
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-6 shadow-sm">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-destructive">Erro ao carregar informações</h3>
                <p className="text-sm text-destructive/80 mt-1">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!business) {
    return (
      <div className="space-y-6 bg-background text-foreground min-h-screen">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Informações da Empresa</h1>
          <p className="text-muted-foreground">
            Dados cadastrais e de contato
          </p>
        </div>

        {/* Empty State Card */}
        <div className="max-w-2xl">
          <div className="rounded-xl bg-muted/50 border p-6 shadow-sm">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Nenhuma empresa cadastrada</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Você precisa cadastrar uma empresa primeiro para visualizar as informações.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const formatDate = (dateInput: any) => {
    try {
      // Se a entrada estiver vazia, nula ou indefinida
      if (!dateInput || dateInput === 'null' || dateInput === 'undefined') {
        return 'Não informado'
      }

      // Se for um objeto com propriedade value (ValueObject)
      if (typeof dateInput === 'object' && dateInput.value) {
        dateInput = dateInput.value
      }

      // Se for um objeto Date
      if (dateInput instanceof Date) {
        if (isNaN(dateInput.getTime())) {
          return 'Data inválida'
        }
        return dateInput.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }

      // Se for uma string
      if (typeof dateInput === 'string') {
        let date: Date;
        
        // Se já for um timestamp/ISO string válido
        if (dateInput.includes('T') || dateInput.includes('Z')) {
          date = new Date(dateInput)
        } 
        // Se for apenas uma data (YYYY-MM-DD)
        else if (dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
          date = new Date(dateInput + 'T00:00:00')
        }
        // Tentar parsing direto
        else {
          date = new Date(dateInput)
        }

        // Verificar se a data é válida
        if (isNaN(date.getTime())) {
          return 'Data inválida'
        }

        return date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }

      // Se for um número (timestamp)
      if (typeof dateInput === 'number') {
        const date = new Date(dateInput)
        if (isNaN(date.getTime())) {
          return 'Data inválida'
        }
        
        return date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }

      // Fallback: tentar converter para string e processar
      return formatDate(String(dateInput))
      
    } catch (error) {
      console.error('Erro ao formatar data:', error, 'Input:', dateInput)
      return 'Erro na data'
    }
  }

  const formatDocument = (document: string) => {
    const cleanDoc = document.replace(/\D/g, '')
    
    if (cleanDoc.length === 14) {
      return cleanDoc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    } else if (cleanDoc.length === 11) {
      return cleanDoc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    }
    
    return document
  }

  const formatPhone = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.length === 11) {
      return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    } else if (cleanPhone.length === 10) {
      return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    }
    return phone
  }

  const contactItems = [
    {
      icon: Mail,
      label: 'E-mail',
      value: business.email,
      action: `mailto:${business.email}`,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      icon: Phone,
      label: 'Telefone',
      value: formatPhone(business.phone),
      action: `tel:${business.phone}`,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      icon: MessageSquare,
      label: 'WhatsApp',
      value: formatPhone(business.whatsapp),
      action: `https://wa.me/55${business.whatsapp.replace(/\D/g, '')}`,
      color: 'text-emerald-600 dark:text-emerald-400'
    }
  ]

  return (
    <div className="space-y-6 bg-background text-foreground min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Informações da Empresa</h1>
          <p className="text-muted-foreground mt-1">
            Dados cadastrais e informações de contato
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => window.history.back()}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </button>

          <Link
            href={`/empresa/editar?id=${businessId}`}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Info Card */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Dados da Empresa</h2>
                <p className="text-sm text-muted-foreground">Informações básicas e documentação</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Nome da Empresa</label>
                  <p className="text-foreground font-medium bg-muted/50 px-3 py-2 rounded-lg">
                    {business.name}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">CNPJ/CPF</label>
                  <p className="text-foreground font-mono bg-muted/50 px-3 py-2 rounded-lg">
                    {formatDocument(business.document)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Logo Upload Card */}
        <div className="space-y-6">
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Logo da Empresa</h3>
            <LogoUpload 
              businessId={businessId}
              currentLogoUrl={business.logoUrl}
              onLogoUpdated={(newLogoUrl) => {
                setBusiness(prev => prev ? { ...prev, logoUrl: newLogoUrl } : null)
              }}
            />
          </div>

          {/* Contact Info Card */}
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Contato</h3>
            
            <div className="space-y-4">
              {contactItems.map((item, index) => {
                const Icon = item.icon
                return (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50`}>
                      <Icon className={`h-5 w-5 ${item.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                      <a 
                        href={item.action}
                        target={item.label === 'WhatsApp' ? '_blank' : undefined}
                        rel={item.label === 'WhatsApp' ? 'noopener noreferrer' : undefined}
                        className={`text-sm font-medium hover:underline ${item.color}`}
                      >
                        {item.value}
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* System Info Card */}
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50">
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Sistema</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Data de Criação</p>
                <p className="text-sm text-foreground bg-muted/30 px-3 py-2 rounded-lg">
                  {formatDate(business.createdAt)}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Última Atualização</p>
                <p className="text-sm text-foreground bg-muted/30 px-3 py-2 rounded-lg">
                  {formatDate(business.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
        <div className="flex items-center space-x-3">
          <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          <div>
            <p className="font-medium text-emerald-900 dark:text-emerald-200">Empresa Ativa</p>
            <p className="text-sm text-emerald-800 dark:text-emerald-300">
              Todas as informações estão atualizadas e a empresa está ativa no sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BusinessInfoPage() {
  const { businessInfo, loading: userLoading, error: userError, hasCompany, companyId } = useUserBusiness()

  if (userLoading) {
    return (
      <ProtectedRoute>
        <LayoutWithSidebar>
          <div className="space-y-6 bg-background text-foreground min-h-screen">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-foreground">Informações da Empresa</h1>
              <p className="text-muted-foreground">
                Dados cadastrais e de contato
              </p>
            </div>
            
            {/* Loading */}
            <div className="flex items-center justify-center min-h-[40vh]">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground">Verificando informações do usuário...</p>
              </div>
            </div>
          </div>
        </LayoutWithSidebar>
      </ProtectedRoute>
    )
  }

  if (userError) {
    return (
      <ProtectedRoute>
        <LayoutWithSidebar>
          <div className="space-y-6 bg-background text-foreground min-h-screen">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-foreground">Informações da Empresa</h1>
              <p className="text-muted-foreground">
                Dados cadastrais e de contato
              </p>
            </div>

            {/* Error Card */}
            <div className="max-w-2xl">
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-6 shadow-sm">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-destructive">Erro ao carregar informações do usuário</h3>
                    <p className="text-sm text-destructive/80 mt-1">{userError}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </LayoutWithSidebar>
      </ProtectedRoute>
    )
  }

  if (!hasCompany || !companyId) {
    return (
        <ProtectedRoute>
          <LayoutWithSidebar>
          <div className="space-y-6 bg-background text-foreground min-h-screen">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-foreground">Informações da Empresa</h1>
              <p className="text-muted-foreground">
                Configure sua empresa no sistema
              </p>
            </div>

            {/* Warning Card */}
            <div className="max-w-2xl">
              <div className="rounded-xl bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 p-6 shadow-sm">
                <div className="flex items-center space-x-3 mb-4">
                  <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">Nenhuma empresa encontrada</h3>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                      Você ainda não tem uma empresa cadastrada no sistema.
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <a 
                    href="/empresa/cadastro" 
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors shadow-sm"
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    Cadastrar Empresa
                  </a>
                </div>
              </div>
            </div>
          </div>
        </LayoutWithSidebar>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <LayoutWithSidebar>
        <BusinessInfo businessId={companyId} />
      </LayoutWithSidebar>
    </ProtectedRoute>
  )
}
