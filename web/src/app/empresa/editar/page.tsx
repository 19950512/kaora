'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import LayoutWithSidebar from '@/components/layout-with-sidebar'
import { LogoUpload } from '@/components/business/LogoUpload'
import { useUserBusiness } from '@/hooks/useUserBusiness'
import type { Business } from '@/types/business'
import { 
  Building2, 
  FileText, 
  MapPin, 
  Phone, 
  Globe, 
  User, 
  Mail, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  Save
} from 'lucide-react'

function EmpresaEditarContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const businessId = searchParams.get('id')
  const { hasCompany, loading: userLoading, error: userError, companyId } = useUserBusiness()
  
  const [business, setBusiness] = useState<Business | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    businessName: '',
    businessDocument: '',
    businessType: '',
    businessAddress: '',
    businessPhone: '',
    businessWebsite: '',
    businessDescription: '',
    businessEmail: '',
    businessWhatsapp: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Carregar dados da empresa
  useEffect(() => {
    if (!businessId && !companyId) {
      router.push('/empresa/info')
      return
    }

    const idToUse = businessId || companyId
    if (!idToUse) return

    const fetchBusiness = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/business/get?businessId=${idToUse}`)
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Erro ao buscar informações da empresa')
        }

        const businessData = await response.json()
        setBusiness(businessData)
        setLogoUrl(businessData.logoUrl || null)
        
        // Preencher formulário com dados existentes
        setFormData({
          businessName: businessData.name || '',
          businessDocument: businessData.document || '',
          businessType: businessData.type || '',
          businessAddress: businessData.address || '',
          businessPhone: businessData.phone || '',
          businessWebsite: businessData.website || '',
          businessDescription: businessData.description || '',
          businessEmail: businessData.email || '',
          businessWhatsapp: businessData.whatsapp || ''
        })
      } catch (err) {
        console.error('Erro ao buscar empresa:', err)
        setFormErrors({ general: err instanceof Error ? err.message : 'Erro desconhecido' })
      } finally {
        setLoading(false)
      }
    }

    fetchBusiness()
  }, [businessId, companyId, router])

  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!formData.businessName.trim()) {
      errors.businessName = 'Nome da empresa é obrigatório'
    }
    
    if (!formData.businessDocument.trim()) {
      errors.businessDocument = 'CNPJ/CPF é obrigatório'
    } else {
      const cleanDoc = formData.businessDocument.replace(/\D/g, '')
      if (cleanDoc.length !== 11 && cleanDoc.length !== 14) {
        errors.businessDocument = 'CNPJ deve ter 14 dígitos ou CPF deve ter 11 dígitos'
      }
    }

    if (!formData.businessPhone.trim()) {
      errors.businessPhone = 'Telefone é obrigatório'
    }

    if (!formData.businessEmail.trim()) {
      errors.businessEmail = 'E-mail é obrigatório'
    } else if (!/\S+@\S+\.\S+/.test(formData.businessEmail)) {
      errors.businessEmail = 'E-mail inválido'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleLogoUpdated = (newLogoUrl: string) => {
    setLogoUrl(newLogoUrl)
    console.log('✅ Logo atualizada:', newLogoUrl)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setSaving(true)
      setFormErrors({})

      const response = await fetch('/api/business/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId: business?.id,
          name: formData.businessName.trim(),
          document: formData.businessDocument.replace(/\D/g, ''),
          type: formData.businessType,
          address: formData.businessAddress.trim(),
          phone: formData.businessPhone.replace(/\D/g, ''),
          website: formData.businessWebsite.trim(),
          description: formData.businessDescription.trim(),
          email: formData.businessEmail.trim(),
          whatsapp: formData.businessWhatsapp.replace(/\D/g, '')
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao atualizar empresa')
      }

      const result = await response.json()
      console.log('✅ Empresa atualizada:', result)
      
      setSaveSuccess(true)
      setTimeout(() => {
        router.push('/empresa/info')
      }, 1500)

    } catch (err) {
      console.error('❌ Erro ao atualizar empresa:', err)
      setFormErrors({ 
        general: err instanceof Error ? err.message : 'Erro desconhecido ao atualizar empresa' 
      })
    } finally {
      setSaving(false)
    }
  }

  if (userLoading || loading) {
    return (
      <ProtectedRoute>
        <LayoutWithSidebar>
          <div className="space-y-6 bg-background text-foreground min-h-screen">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Editar Empresa</h1>
              <p className="text-muted-foreground">
                Carregando informações da empresa...
              </p>
            </div>
            
            <div className="flex items-center justify-center min-h-[40vh]">
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Carregando dados da empresa...</p>
              </div>
            </div>
          </div>
        </LayoutWithSidebar>
      </ProtectedRoute>
    )
  }

  if (userError || formErrors.general) {
    return (
      <ProtectedRoute>
        <LayoutWithSidebar>
          <div className="space-y-6 bg-background text-foreground min-h-screen">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Editar Empresa</h1>
              <p className="text-muted-foreground">
                Erro ao carregar informações
              </p>
            </div>

            <div className="max-w-2xl">
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-6 shadow-sm">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-destructive">Erro</h3>
                    <p className="text-sm text-destructive/80 mt-1">
                      {userError || formErrors.general}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </LayoutWithSidebar>
      </ProtectedRoute>
    )
  }

  if (!hasCompany && !business) {
    return (
      <ProtectedRoute>
        <LayoutWithSidebar>
          <div className="space-y-6 bg-background text-foreground min-h-screen">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Editar Empresa</h1>
              <p className="text-muted-foreground">
                Nenhuma empresa encontrada
              </p>
            </div>

            <div className="max-w-2xl">
              <div className="rounded-xl bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 p-6 shadow-sm">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">Empresa não encontrada</h3>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                      Não foi possível carregar os dados da empresa para edição.
                    </p>
                  </div>
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
        <div className="space-y-6 bg-background text-foreground min-h-screen">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Editar Empresa</h1>
              <p className="text-muted-foreground mt-1">
                Atualize as informações cadastrais da sua empresa
              </p>
            </div>
            <button 
              onClick={() => router.push('/empresa/info')}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </button>
          </div>

          {/* Success Message */}
          {saveSuccess && (
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="font-medium text-emerald-900 dark:text-emerald-200">Empresa atualizada com sucesso!</p>
                  <p className="text-sm text-emerald-800 dark:text-emerald-300">
                    Redirecionando para a página de informações...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Logo Upload Card */}
            <div className="bg-card rounded-xl shadow-sm border border-border p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Logo da Empresa</h2>
                  <p className="text-sm text-muted-foreground">Faça upload da logo da sua empresa</p>
                </div>
              </div>

              {businessId && (
                <LogoUpload
                  businessId={businessId}
                  currentLogoUrl={logoUrl || undefined}
                  onLogoUpdated={handleLogoUpdated}
                />
              )}
            </div>

            {/* Company Data Card */}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="businessName" className="block text-sm font-medium text-foreground mb-2">
                    Nome da Empresa *
                  </label>
                  <input
                    type="text"
                    id="businessName"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Nome fantasia ou razão social"
                    disabled={saving}
                  />
                  {formErrors.businessName && (
                    <p className="mt-1 text-sm text-destructive">{formErrors.businessName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="businessDocument" className="block text-sm font-medium text-foreground mb-2">
                    CNPJ/CPF *
                  </label>
                  <input
                    type="text"
                    id="businessDocument"
                    name="businessDocument"
                    value={formData.businessDocument}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="00.000.000/0000-00 ou 000.000.000-00"
                    disabled={saving}
                  />
                  {formErrors.businessDocument && (
                    <p className="mt-1 text-sm text-destructive">{formErrors.businessDocument}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="businessType" className="block text-sm font-medium text-foreground mb-2">
                    Tipo de Empresa
                  </label>
                  <select
                    id="businessType"
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    disabled={saving}
                  >
                    <option value="">Selecione o tipo</option>
                    <option value="MEI">MEI - Microempreendedor Individual</option>
                    <option value="ME">ME - Microempresa</option>
                    <option value="EPP">EPP - Empresa de Pequeno Porte</option>
                    <option value="LTDA">LTDA - Sociedade Limitada</option>
                    <option value="SA">SA - Sociedade Anônima</option>
                    <option value="EIRELI">EIRELI - Empresa Individual</option>
                    <option value="AUTONOMO">Autônomo</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="businessAddress" className="block text-sm font-medium text-foreground mb-2">
                    Endereço
                  </label>
                  <input
                    type="text"
                    id="businessAddress"
                    name="businessAddress"
                    value={formData.businessAddress}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Endereço completo"
                    disabled={saving}
                  />
                </div>
              </div>
            </div>

            {/* Contact Data Card */}
            <div className="bg-card rounded-xl shadow-sm border border-border p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Contato</h2>
                  <p className="text-sm text-muted-foreground">Informações de contato e comunicação</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="businessEmail" className="block text-sm font-medium text-foreground mb-2">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    id="businessEmail"
                    name="businessEmail"
                    value={formData.businessEmail}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="email@empresa.com"
                    disabled={saving}
                  />
                  {formErrors.businessEmail && (
                    <p className="mt-1 text-sm text-destructive">{formErrors.businessEmail}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="businessPhone" className="block text-sm font-medium text-foreground mb-2">
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    id="businessPhone"
                    name="businessPhone"
                    value={formData.businessPhone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="(11) 9999-9999"
                    disabled={saving}
                  />
                  {formErrors.businessPhone && (
                    <p className="mt-1 text-sm text-destructive">{formErrors.businessPhone}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="businessWhatsapp" className="block text-sm font-medium text-foreground mb-2">
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    id="businessWhatsapp"
                    name="businessWhatsapp"
                    value={formData.businessWhatsapp}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="(11) 9999-9999"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label htmlFor="businessWebsite" className="block text-sm font-medium text-foreground mb-2">
                    Site/Website
                  </label>
                  <input
                    type="url"
                    id="businessWebsite"
                    name="businessWebsite"
                    value={formData.businessWebsite}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="https://www.empresa.com"
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="businessDescription" className="block text-sm font-medium text-foreground mb-2">
                  Descrição da Empresa
                </label>
                <textarea
                  id="businessDescription"
                  name="businessDescription"
                  value={formData.businessDescription}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  placeholder="Descreva a atividade principal da sua empresa..."
                  disabled={saving}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push('/empresa/info')}
                className="px-6 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-input rounded-lg hover:bg-muted/50 transition-colors"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-6 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </LayoutWithSidebar>
    </ProtectedRoute>
  )
}

export default function EmpresaEditarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Carregando...</span>
        </div>
      </div>
    }>
      <EmpresaEditarContent />
    </Suspense>
  )
}
