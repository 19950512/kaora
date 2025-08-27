# Kaora - Sistema de Gestão Empresarial

Aplicação completa para gestão de empresas, clientes e faturamento construída com Next.js 15, TypeScript e Clean Architecture.

## 🚀 Deploy em Produção

### Início Rápido
```bash
# Interface de entrada (recomendado)
./start.sh

# Menu interativo completo
./scripts/kaora.sh

# Deploy direto
./scripts/deploy.sh initial
```

### 📁 Scripts Organizados
Todos os scripts estão organizados na pasta **`scripts/`** com documentação completa:

- **[📋 Guia Completo dos Scripts](./scripts/README.md)** - Documentação detalhada
- **[⚡ Comandos Rápidos](./COMANDOS.md)** - Lista de comandos essenciais  
- **[📖 Workflow Detalhado](./WORKFLOW.md)** - Guia para equipes

## 🏗️ Arquitetura

### Monorepo Estruturado
```
kaora/
├── packages/
│   ├── domain/          # Regras de negócio e entidades
│   ├── application/     # Casos de uso e serviços
│   └── infrastructure/  # Prisma, banco de dados
├── web/                 # Interface Next.js
└── scripts/            # Scripts de deploy e manutenção
```

### Tecnologias
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Prisma ORM, PostgreSQL, Redis
- **Deploy**: Docker, Docker Compose
- **Arquitetura**: Clean Architecture, DDD

## 🛠️ Desenvolvimento

### Configuração Local
```bash
# Instalar dependências
pnpm install

# Configurar banco de dados
cp .env.example .env
pnpm db:push

# Executar em desenvolvimento
pnpm dev
```

### Estrutura de Módulos
- **Account**: Gestão de contas e autenticação
- **Business**: Informações da empresa
- **User**: Gestão de usuários
- **Product**: Catálogo de produtos
- **Contract**: Contratos e propostas
- **Billing**: Faturamento e cobranças

## 📦 Deploy

### Produção
```bash
# Deploy inicial
./scripts/deploy.sh initial

# Atualizar aplicação
./scripts/deploy.sh rebuild kaora-app
```

### Backup
```bash
# Backup manual
./scripts/backup.sh

# Backup automático (cron)
0 2 * * * /path/to/kaora/scripts/backup.sh
```

---

**Desenvolvido com ❤️ para gestão empresarial eficiente**
