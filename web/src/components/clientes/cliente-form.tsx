'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { 
  ClienteFormData, 
  Natureza, 
  OrigemCadastro, 
  Sexo, 
  EstadoCivil, 
  TipoEndereco 
} from '@/types/cliente'

// Schema de validação
const clienteSchema = z.object({
  // Informações Básicas
  natureza: z.nativeEnum(Natureza),
  origemCadastro: z.nativeEnum(OrigemCadastro),
  nomeCompleto: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  documento: z.string().min(11, 'Documento inválido'),
  cnh: z.string().optional(),
  rg: z.string().optional(),
  nomeMae: z.string().optional(),
  profissao: z.string().optional(),
  sexo: z.nativeEnum(Sexo).optional(),
  estadoCivil: z.nativeEnum(EstadoCivil).optional(),
  dataNascimento: z.string().optional(),
  nacionalidade: z.string().optional(),
  rne: z.string().optional(),
  taxaAdministrativa: z.number().optional(),
  escolaridade: z.string().optional(),
  orgaoExpedidor: z.string().optional(),
  numeroPassaporte: z.string().optional(),
  detalhes: z.string().optional(),
  
  // Arrays relacionados
  enderecos: z.array(z.object({
    tipo: z.nativeEnum(TipoEndereco),
    cep: z.string().optional(),
    bairro: z.string().optional(),
    cidade: z.string().optional(),
    estado: z.string().optional(),
    logradouro: z.string().optional(),
    numero: z.string().optional(),
    complemento: z.string().optional(),
  })),
  
  contatos: z.array(z.object({
    whatsapp: z.string().optional(),
    telefones: z.array(z.string()),
    emails: z.array(z.string()),
    detalhes: z.string().optional(),
  })),
  
  contasBancarias: z.array(z.object({
    banco: z.string().min(1, 'Banco é obrigatório'),
    agencia: z.string().min(1, 'Agência é obrigatória'),
    conta: z.string().min(1, 'Conta é obrigatória'),
    chavePix: z.string().optional(),
    ativa: z.boolean(),
    detalhes: z.string().optional(),
  })),
  
  referencias: z.array(z.object({
    rendaAproximada: z.number().optional(),
    outrasRendas: z.string().optional(),
    empresa: z.string().optional(),
    dataInicioEmpresa: z.string().optional(),
    logradouroEmpresa: z.string().optional(),
    bairroEmpresa: z.string().optional(),
    numeroEmpresa: z.string().optional(),
    complementoEmpresa: z.string().optional(),
    telefonesEmpresa: z.array(z.string()),
    pessoas: z.array(z.object({
      nomeCompleto: z.string().min(1, 'Nome é obrigatório'),
      telefone: z.string().min(1, 'Telefone é obrigatório'),
      possuiCarro: z.boolean(),
      marcaCarro: z.string().optional(),
      modeloCarro: z.string().optional(),
      anoCarro: z.number().optional(),
      valorCarro: z.number().optional(),
      detalhes: z.string().optional(),
    })),
  })),
})

type ClienteFormValues = z.infer<typeof clienteSchema>

const defaultValues: ClienteFormValues = {
  natureza: Natureza.FISICA,
  origemCadastro: OrigemCadastro.WEB,
  nomeCompleto: '',
  documento: '',
  enderecos: [{ tipo: TipoEndereco.NACIONAL }],
  contatos: [{ telefones: [], emails: [] }],
  contasBancarias: [],
  referencias: [{
    telefonesEmpresa: [],
    pessoas: [],
  }],
}

export function ClienteForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('basicas')

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
    defaultValues,
  })

  const {
    fields: enderecosFields,
    append: appendEndereco,
    remove: removeEndereco,
  } = useFieldArray({
    control,
    name: 'enderecos',
  })

  const {
    fields: contasFields,
    append: appendConta,
    remove: removeConta,
  } = useFieldArray({
    control,
    name: 'contasBancarias',
  })

  const naturezaWatch = watch('natureza')

  const onSubmit = async (data: ClienteFormValues) => {
    setIsSubmitting(true)
    try {
      // TODO: Implementar salvamento no banco
      console.log('Dados do cliente:', data)
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Cliente cadastrado com sucesso!', {
        description: `${data.nomeCompleto} foi adicionado ao sistema.`
      })
      
      router.push('/clientes')
    } catch (error) {
      console.error('Erro ao salvar cliente:', error)
      toast.error('Erro ao cadastrar cliente', {
        description: 'Tente novamente em alguns instantes.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const tabs = [
    { id: 'basicas', nome: 'Informações Básicas' },
    { id: 'enderecos', nome: 'Endereços' },
    { id: 'contatos', nome: 'Contatos' },
    { id: 'contas', nome: 'Contas Bancárias' },
    { id: 'referencias', nome: 'Referências' },
  ]

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/clientes"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar
            </Link>
          </div>
          <button
            form="cliente-form"
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Salvando...' : 'Salvar Cliente'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              {tab.nome}
            </button>
          ))}
        </nav>
      </div>

      {/* Form */}
      <form id="cliente-form" onSubmit={handleSubmit(onSubmit)} className="p-6">
        {/* Informações Básicas */}
        {activeTab === 'basicas' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Natureza *
                </label>
                <select
                  {...register('natureza')}
                  className="mt-1 block w-full px-3 py-2 border border-input bg-background rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                >
                  <option value={Natureza.FISICA}>Pessoa Física</option>
                  <option value={Natureza.JURIDICA}>Pessoa Jurídica</option>
                </select>
                {errors.natureza && (
                  <p className="mt-1 text-sm text-destructive">{errors.natureza.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Origem do Cadastro *
                </label>
                <select
                  {...register('origemCadastro')}
                  className="mt-1 block w-full px-3 py-2 border border-input bg-background rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                >
                  <option value={OrigemCadastro.WEB}>Web</option>
                  <option value={OrigemCadastro.APP}>App</option>
                  <option value={OrigemCadastro.PRESENCIAL}>Presencial</option>
                  <option value={OrigemCadastro.TELEFONE}>Telefone</option>
                  <option value={OrigemCadastro.EMAIL}>E-mail</option>
                  <option value={OrigemCadastro.INDICACAO}>Indicação</option>
                </select>
                {errors.origemCadastro && (
                  <p className="mt-1 text-sm text-destructive">{errors.origemCadastro.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground">
                Nome Completo *
              </label>
              <input
                type="text"
                {...register('nomeCompleto')}
                className="mt-1 block w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                placeholder="Digite o nome completo"
              />
              {errors.nomeCompleto && (
                <p className="mt-1 text-sm text-destructive">{errors.nomeCompleto.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground">
                  {naturezaWatch === Natureza.FISICA ? 'CPF' : 'CNPJ'} *
                </label>
                <input
                  type="text"
                  {...register('documento')}
                  className="mt-1 block w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder={naturezaWatch === Natureza.FISICA ? '000.000.000-00' : '00.000.000/0000-00'}
                />
                {errors.documento && (
                  <p className="mt-1 text-sm text-destructive">{errors.documento.message}</p>
                )}
              </div>

              {naturezaWatch === Natureza.FISICA && (
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    RG
                  </label>
                  <input
                    type="text"
                    {...register('rg')}
                    className="mt-1 block w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    placeholder="Digite o RG"
                  />
                </div>
              )}
            </div>

            {/* Mais campos básicos conforme necessário */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-foreground">
                  CNH
                </label>
                <input
                  type="text"
                  {...register('cnh')}
                  className="mt-1 block w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="Digite o número da CNH"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">
                  Profissão
                </label>
                <input
                  type="text"
                  {...register('profissao')}
                  className="mt-1 block w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="Digite a profissão"
                />
              </div>

              {naturezaWatch === Natureza.FISICA && (
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    Sexo
                  </label>
                  <select
                    {...register('sexo')}
                    className="mt-1 block w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  >
                    <option value="">Selecionar...</option>
                    <option value={Sexo.MASCULINO}>Masculino</option>
                    <option value={Sexo.FEMININO}>Feminino</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Endereços */}
        {activeTab === 'enderecos' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-foreground">Endereços</h3>
              <button
                type="button"
                onClick={() => appendEndereco({ tipo: TipoEndereco.NACIONAL })}
                className="inline-flex items-center px-3 py-2 border border-input bg-background rounded-md text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Endereço
              </button>
            </div>

            {enderecosFields.map((field, index) => (
              <div key={field.id} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-medium text-foreground">
                    Endereço {index + 1}
                  </h4>
                  {enderecosFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEndereco(index)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground">
                      Tipo
                    </label>
                    <select
                      {...register(`enderecos.${index}.tipo`)}
                      className="mt-1 block w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    >
                      <option value={TipoEndereco.NACIONAL}>Nacional</option>
                      <option value={TipoEndereco.INTERNACIONAL}>Internacional</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground">
                      CEP
                    </label>
                    <input
                      type="text"
                      {...register(`enderecos.${index}.cep`)}
                      className="mt-1 block w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      placeholder="00000-000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground">
                      Cidade
                    </label>
                    <input
                      type="text"
                      {...register(`enderecos.${index}.cidade`)}
                      className="mt-1 block w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      placeholder="Digite a cidade"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground">
                      Logradouro
                    </label>
                    <input
                      type="text"
                      {...register(`enderecos.${index}.logradouro`)}
                      className="mt-1 block w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      placeholder="Digite o logradouro"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground">
                      Número
                    </label>
                    <input
                      type="text"
                      {...register(`enderecos.${index}.numero`)}
                      className="mt-1 block w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      placeholder="Digite o número"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground">
                      Complemento
                    </label>
                    <input
                      type="text"
                      {...register(`enderecos.${index}.complemento`)}
                      className="mt-1 block w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      placeholder="Apto, bloco, etc."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contas Bancárias */}
        {activeTab === 'contas' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-foreground">Contas Bancárias</h3>
              <button
                type="button"
                onClick={() => appendConta({ banco: '', agencia: '', conta: '', ativa: true })}
                className="inline-flex items-center px-3 py-2 border border-input bg-background rounded-md text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Conta
              </button>
            </div>

            {contasFields.map((field, index) => (
              <div key={field.id} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-medium text-foreground">
                    Conta {index + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeConta(index)}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground">
                      Banco *
                    </label>
                    <input
                      type="text"
                      {...register(`contasBancarias.${index}.banco`)}
                      className="mt-1 block w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      placeholder="Nome do banco"
                    />
                    {errors.contasBancarias?.[index]?.banco && (
                      <p className="mt-1 text-sm text-destructive">
                        {errors.contasBancarias[index]?.banco?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground">
                      Agência *
                    </label>
                    <input
                      type="text"
                      {...register(`contasBancarias.${index}.agencia`)}
                      className="mt-1 block w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      placeholder="0000"
                    />
                    {errors.contasBancarias?.[index]?.agencia && (
                      <p className="mt-1 text-sm text-destructive">
                        {errors.contasBancarias[index]?.agencia?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground">
                      Conta *
                    </label>
                    <input
                      type="text"
                      {...register(`contasBancarias.${index}.conta`)}
                      className="mt-1 block w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      placeholder="00000-0"
                    />
                    {errors.contasBancarias?.[index]?.conta && (
                      <p className="mt-1 text-sm text-destructive">
                        {errors.contasBancarias[index]?.conta?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground">
                      Chave PIX
                    </label>
                    <input
                      type="text"
                      {...register(`contasBancarias.${index}.chavePix`)}
                      className="mt-1 block w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      placeholder="CPF, e-mail, telefone ou chave aleatória"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...register(`contasBancarias.${index}.ativa`)}
                      className="h-4 w-4 text-primary focus:ring-ring border-input rounded"
                    />
                    <label className="ml-2 block text-sm text-foreground">
                      Conta ativa
                    </label>
                  </div>
                </div>
              </div>
            ))}

            {contasFields.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhuma conta bancária adicionada</p>
                <p className="text-sm">Clique em "Adicionar Conta" para começar</p>
              </div>
            )}
          </div>
        )}

        {/* Placeholders para outras abas */}
        {activeTab === 'contatos' && (
          <div className="text-center py-8 text-muted-foreground">
            <p>Seção de contatos em desenvolvimento</p>
          </div>
        )}

        {activeTab === 'referencias' && (
          <div className="text-center py-8 text-muted-foreground">
            <p>Seção de referências em desenvolvimento</p>
          </div>
        )}
      </form>
    </div>
  )
}
