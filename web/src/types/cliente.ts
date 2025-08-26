// Enums
export enum Natureza {
  FISICA = 'FISICA',
  JURIDICA = 'JURIDICA'
}

export enum OrigemCadastro {
  WEB = 'WEB',
  APP = 'APP',
  PRESENCIAL = 'PRESENCIAL',
  TELEFONE = 'TELEFONE',
  EMAIL = 'EMAIL',
  INDICACAO = 'INDICACAO'
}

export enum Sexo {
  MASCULINO = 'MASCULINO',
  FEMININO = 'FEMININO'
}

export enum EstadoCivil {
  SOLTEIRO = 'SOLTEIRO',
  CASADO = 'CASADO',
  DIVORCIADO = 'DIVORCIADO',
  VIUVO = 'VIUVO',
  UNIAO_ESTAVEL = 'UNIAO_ESTAVEL'
}

export enum TipoEndereco {
  NACIONAL = 'NACIONAL',
  INTERNACIONAL = 'INTERNACIONAL'
}

// Interfaces base
export interface Cliente {
  id: string
  natureza: Natureza
  origemCadastro: OrigemCadastro
  nomeCompleto: string
  documento: string
  cnh?: string | null
  rg?: string | null
  nomeMae?: string | null
  profissao?: string | null
  sexo?: Sexo | null
  estadoCivil?: EstadoCivil | null
  dataNascimento?: Date | null
  nacionalidade?: string | null
  rne?: string | null
  taxaAdministrativa?: number | null
  escolaridade?: string | null
  orgaoExpedidor?: string | null
  numeroPassaporte?: string | null
  detalhes?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Endereco {
  id: string
  clienteId: string
  tipo: TipoEndereco
  cep?: string | null
  bairro?: string | null
  cidade?: string | null
  estado?: string | null
  logradouro?: string | null
  numero?: string | null
  complemento?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Contato {
  id: string
  clienteId: string
  whatsapp?: string | null
  telefones: string[]
  emails: string[]
  detalhes?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface ContaBancaria {
  id: string
  clienteId: string
  banco: string
  agencia: string
  conta: string
  chavePix?: string | null
  ativa: boolean
  detalhes?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Referencia {
  id: string
  clienteId: string
  rendaAproximada?: number | null
  outrasRendas?: string | null
  empresa?: string | null
  dataInicioEmpresa?: Date | null
  logradouroEmpresa?: string | null
  bairroEmpresa?: string | null
  numeroEmpresa?: string | null
  complementoEmpresa?: string | null
  telefonesEmpresa: string[]
  createdAt: Date
  updatedAt: Date
}

export interface PessoaReferencia {
  id: string
  referenciaId: string
  nomeCompleto: string
  telefone: string
  possuiCarro: boolean
  marcaCarro?: string | null
  modeloCarro?: string | null
  anoCarro?: number | null
  valorCarro?: number | null
  detalhes?: string | null
  createdAt: Date
  updatedAt: Date
}

// Tipos compostos
export type ClienteCompleto = Cliente & {
  enderecos: Endereco[]
  contatos: Contato[]
  contasBancarias: ContaBancaria[]
  referencias: (Referencia & {
    pessoas: PessoaReferencia[]
  })[]
}

export type ClienteFormData = Omit<Cliente, 'id' | 'createdAt' | 'updatedAt'> & {
  enderecos: Omit<Endereco, 'id' | 'clienteId' | 'createdAt' | 'updatedAt'>[]
  contatos: Omit<Contato, 'id' | 'clienteId' | 'createdAt' | 'updatedAt'>[]
  contasBancarias: Omit<ContaBancaria, 'id' | 'clienteId' | 'createdAt' | 'updatedAt'>[]
  referencias: (Omit<Referencia, 'id' | 'clienteId' | 'createdAt' | 'updatedAt'> & {
    pessoas: Omit<PessoaReferencia, 'id' | 'referenciaId' | 'createdAt' | 'updatedAt'>[]
  })[]
}
