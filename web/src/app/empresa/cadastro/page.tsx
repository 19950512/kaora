'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import LayoutWithSidebar from '@/components/layout-with-sidebar'
import { useUserBusiness } from '@/hooks/useUserBusiness'
import { 
  Building2, 
  FileText, 
  MapPin, 
  Phone, 
  Globe, 
  User, 
  Mail, 
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'

export default function EmpresaCadastroPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { hasCompany, loading: userLoading, error: userError } = useUserBusiness()
  
  const [formData, setFormData] = useState({
    businessName: '',
    businessDocument: '',
    businessType: '',
    businessAddress: '',
    businessPhone: '',
    businessWebsite: '',
    businessDescription: ''
  })
  const [loading, setLoading] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Se o usuário já tem empresa, redirecionar para a página de informações
  useEffect(() => {
    if (!userLoading && hasCompany) {
      router.push('/empresa/info')
    }
  }, [hasCompany, userLoading, router])

  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!formData.businessName.trim()) {
      errors.businessName = 'Nome da empresa é obrigatório'
    }
    
    if (!formData.businessDocument.trim()) {
      errors.businessDocument = 'CNPJ é obrigatório'
    }
    
    if (!formData.businessType) {
      errors.businessType = 'Tipo de negócio é obrigatório'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)

    try {
      const response = await fetch('/api/business/create-from-google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Dados da empresa
          businessName: formData.businessName,
          businessDocument: formData.businessDocument,
          businessType: formData.businessType,
          businessAddress: formData.businessAddress,
          businessPhone: formData.businessPhone,
          businessWebsite: formData.businessWebsite,
          businessDescription: formData.businessDescription,
          // Dados do usuário (já autenticado via Google)
          responsibleName: session?.user?.name,
          responsibleEmail: session?.user?.email,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        // Redirecionar para a página de informações após sucesso
        router.push('/empresa/info')
      } else {
        // Mostrar erro específico
        setFormErrors({ 
          submit: result.error || 'Erro ao criar empresa. Tente novamente.' 
        })
      }
    } catch (error) {
      console.error('Erro:', error)
      setFormErrors({ 
        submit: 'Erro ao criar empresa. Tente novamente.' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  // Estados de loading do usuário
  if (userLoading) {
    return (
      <ProtectedRoute>
        <LayoutWithSidebar>
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Cadastro da Empresa</h1>
              <p className="text-muted-foreground">
                Configure os dados da sua empresa
              </p>
            </div>
            
            <div className="max-w-4xl">
              <div className="rounded-xl bg-muted/50 border p-6 shadow-sm">
                <div className="flex items-center space-x-3">
                  <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
                  <p className="text-muted-foreground">Carregando informações do usuário...</p>
                </div>
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
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Cadastro da Empresa</h1>
              <p className="text-muted-foreground">
                Configure os dados da sua empresa
              </p>
            </div>
            
            <div className="max-w-4xl">
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-6 shadow-sm">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-destructive">Erro ao carregar informações</h3>
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

  return (
    <ProtectedRoute>
      <LayoutWithSidebar>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-foreground">Cadastro da Empresa</h1>
            <p className="text-muted-foreground">
              Configure os dados da sua empresa no sistema
            </p>
          </div>

          {/* Formulário */}
          <div className="max-w-4xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Erro geral do formulário */}
              {formErrors.submit && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                    <p className="text-sm text-destructive">{formErrors.submit}</p>
                  </div>
                </div>
              )}

              {/* Card - Informações da Empresa */}
              <div className="rounded-xl bg-card border p-6 shadow-sm">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Informações da Empresa</h3>
                    <p className="text-sm text-muted-foreground">Dados cadastrais básicos</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Nome da empresa */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Nome da Empresa *
                    </label>
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-2 bg-background border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
                        formErrors.businessName ? 'border-destructive' : 'border-border'
                      }`}
                      placeholder="Ex: Kaora Tecnologia Ltda"
                    />
                    {formErrors.businessName && (
                      <p className="text-sm text-destructive mt-1">{formErrors.businessName}</p>
                    )}
                  </div>

                  {/* CNPJ */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      CNPJ *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="businessDocument"
                        value={formData.businessDocument}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-4 py-2 pr-10 bg-background border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
                          formErrors.businessDocument ? 'border-destructive' : 'border-border'
                        }`}
                        placeholder="00.000.000/0000-00"
                      />
                      <FileText className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    </div>
                    {formErrors.businessDocument && (
                      <p className="text-sm text-destructive mt-1">{formErrors.businessDocument}</p>
                    )}
                  </div>

                  {/* Tipo de negócio */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Tipo de Negócio *
                    </label>
                    <select
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-2 bg-background border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
                        formErrors.businessType ? 'border-destructive' : 'border-border'
                      }`}
                    >
                      <option value="">Selecione o tipo</option>
                      <option value="retail">🛍️ Varejo</option>
                      <option value="services">🔧 Serviços</option>
                      <option value="technology">💻 Tecnologia</option>
                      <option value="manufacturing">🏭 Indústria</option>
                      <option value="consulting">💼 Consultoria</option>
                      <option value="other">✨ Outro</option>
                    </select>
                    {formErrors.businessType && (
                      <p className="text-sm text-destructive mt-1">{formErrors.businessType}</p>
                    )}
                  </div>

                  {/* Telefone */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Telefone
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        name="businessPhone"
                        value={formData.businessPhone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 pl-10 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="(11) 99999-9999"
                      />
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>

                  {/* Website */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Website
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        name="businessWebsite"
                        value={formData.businessWebsite}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 pl-10 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="https://www.suaempresa.com.br"
                      />
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>

                  {/* Endereço */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Endereço
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="businessAddress"
                        value={formData.businessAddress}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 pl-10 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="Rua, número, bairro, cidade - Estado"
                      />
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>

                  {/* Descrição */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Descrição da Empresa
                    </label>
                    <div className="relative">
                      <textarea
                        name="businessDescription"
                        value={formData.businessDescription}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-2 pl-10 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                        placeholder="Descreva brevemente o que sua empresa faz..."
                      />
                      <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card - Dados do Responsável */}
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-6 shadow-sm">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center">
                    <User className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">Dados do Responsável</h3>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">Autenticado via Google</p>
                  </div>
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-emerald-800 dark:text-emerald-200 mb-2">
                      Nome Completo
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={session?.user?.name || ''}
                        disabled
                        className="w-full px-4 py-2 pl-10 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-700 rounded-lg text-emerald-900 dark:text-emerald-100"
                      />
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-emerald-800 dark:text-emerald-200 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={session?.user?.email || ''}
                        disabled
                        className="w-full px-4 py-2 pl-10 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-700 rounded-lg text-emerald-900 dark:text-emerald-100"
                      />
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex items-center justify-between pt-6">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  Voltar
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-2 bg-primary text-primary-foreground font-medium rounded-lg shadow-sm hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <div className="flex items-center space-x-2">
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Criando empresa...</span>
                      </>
                    ) : (
                      <>
                        <Building2 className="w-4 h-4" />
                        <span>Criar Empresa</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </div>
                </button>
              </div>
            </form>
          </div>
        </div>
      </LayoutWithSidebar>
    </ProtectedRoute>
  )
}
