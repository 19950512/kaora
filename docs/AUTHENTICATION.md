# Configuração de Autenticação - Kaora

## 📋 Visão Geral

Este documento descreve como configurar a autenticação no sistema Kaora, que utiliza NextAuth.js com Google OAuth e autenticação por credenciais.

## 🔧 Configuração das Variáveis de Ambiente

### 1. Arquivo .env Principal (raiz do projeto)

Copie o arquivo `.env.example` e renomeie para `.env`:

```bash
cp .env.example .env
```

### 2. Arquivo .env.local (pasta web/)

Configure as variáveis no arquivo `web/.env.local`:

```bash
# NextAuth Configuration
NEXTAUTH_SECRET="your-nextauth-secret-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth Configuration
GOOGLE_CLIENT_ID="seu-google-client-id"
GOOGLE_CLIENT_SECRET="seu-google-client-secret"
```

## 🔑 Configuração do Google OAuth

### 1. Criar Projeto no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a **Google+ API** e **Google Identity Service**

### 2. Configurar OAuth 2.0

1. Vá para **APIs & Services > Credentials**
2. Clique em **Create Credentials > OAuth 2.0 Client IDs**
3. Configure:
   - **Application type**: Web application
   - **Authorized JavaScript origins**: `http://localhost:3000`
   - **Authorized redirect URIs**: `http://localhost:3000/api/auth/callback/google`

### 3. Obter Credenciais

1. Copie o **Client ID** e **Client Secret**
2. Adicione-os ao arquivo `.env.local`

## 🔒 Variáveis de Ambiente Necessárias

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `NEXTAUTH_URL` | URL base da aplicação | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Chave secreta para JWT | `sua-chave-super-secreta` |
| `GOOGLE_CLIENT_ID` | ID do cliente Google OAuth | `123456789-abcdef.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Chave secreta do Google OAuth | `GOCSPX-abcdefghijk` |

## 🛡️ Segurança

### Arquivos Protegidos pelo .gitignore

- `.env*` - Todos os arquivos de ambiente
- `client_secret_*.json` - Arquivos de credenciais do Google
- `credentials.json` - Arquivo de credenciais genérico

### Produção

⚠️ **IMPORTANTE**: Em produção, use variáveis de ambiente do seu provedor de hospedagem (Vercel, Netlify, etc.) em vez de arquivos .env.

## 🔄 Fluxos de Autenticação

### 1. Google OAuth
1. Usuário clica em "Continuar com Google"
2. Redirecionado para Google
3. Após autorização, retorna para `/api/auth/callback/google`
4. Sistema verifica se usuário tem empresa cadastrada
5. Redireciona para `/auth/company-data` ou `/dashboard`

### 2. Credenciais (Email/Senha)
1. Usuário insere email e senha
2. Validação via `/api/auth/login` (Clean Architecture)
3. Se válido, cria sessão
4. Redireciona para `/dashboard`

## 🚀 Testando a Configuração

Execute o comando de verificação:

```bash
cd web && node -e "
require('dotenv').config({ path: '../.env' });
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL ? '✅' : '❌');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅' : '❌');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅' : '❌');
"
```

## 🐛 Troubleshooting

### Erro: "GOOGLE_CLIENT_ID não configurado"
- Verifique se o arquivo `.env.local` existe na pasta `web/`
- Confirme se as variáveis estão sem espaços ou aspas extras

### Erro: "redirect_uri_mismatch"
- Verifique se a URL de callback no Google Cloud Console está correta
- Deve ser: `http://localhost:3000/api/auth/callback/google`

### Erro de sessão/JWT
- Verifique se `NEXTAUTH_SECRET` está configurado
- Use uma string longa e aleatória para produção
