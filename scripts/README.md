# 🚀 Scripts de Deploy e Gerenciamento - Kaora

Esta pasta contém todos os scripts necessários para deploy, manutenção e monitoramento da aplicação Kaora em produção.

## 📋 Índice Rápido

### 🎯 Script Principal
```bash
./scripts/kaora.sh
```
**Interface interativa** com menu para todas as operações (recomendado para iniciantes)

### ⚡ Comandos Diretos
```bash
# Deploy inicial (primeira vez)
./scripts/deploy.sh initial

# Atualizar aplicação (mais comum)
./scripts/deploy.sh rebuild kaora-app

# Backup dos dados
./scripts/backup.sh
```

---

## 📁 Scripts Disponíveis

| Script | Descrição | Uso Principal |
|--------|-----------|---------------|
| `kaora.sh` | **Menu interativo principal** | Interface amigável para todas as operações |
| `deploy.sh` | Deploy automatizado | `./deploy.sh initial` ou `./deploy.sh rebuild <serviço>` |
| `backup.sh` | Backup do PostgreSQL | `./backup.sh` (executar semanalmente) |
| `test-db-connection.sh` | Teste de conexão com BD | `./test-db-connection.sh` |
| `analyze-docker.sh` | Análise de otimização Docker | `./analyze-docker.sh` |
| `build-optimize.sh` | Build otimizado Docker | `./build-optimize.sh` |

---

## 🚀 Primeiros Passos

### 1. Primeira instalação
```bash
# 1. Configure suas variáveis de ambiente
cp .env.production .env
nano .env

# 2. Execute o deploy inicial
./scripts/deploy.sh initial
```

### 2. Uso diário (recomendado)
```bash
# Menu interativo com todas as opções
./scripts/kaora.sh
```

### 3. Atualização rápida
```bash
# Atualizar apenas a aplicação
./scripts/deploy.sh rebuild kaora-app
```

---

## 📖 Guias Detalhados

- **[COMANDOS.md](../COMANDOS.md)** - Lista completa de comandos
- **[WORKFLOW.md](../WORKFLOW.md)** - Workflow detalhado para equipes
- **[ARCHITECTURE.md](../ARCHITECTURE.md)** - Arquitetura do sistema

---

## 🛠️ Cenários Comuns

### Deploy de nova versão
```bash
./scripts/kaora.sh
# Escolher opção: 2) Atualizar aplicação
```

### Problema na aplicação
```bash
# Ver logs em tempo real
./scripts/kaora.sh
# Escolher opção: 6) Ver logs da aplicação

# Ou diretamente:
docker compose -f docker-compose.prod.yml logs -f kaora-app
```

### Backup de segurança
```bash
./scripts/backup.sh
# Arquivo será salvo em: backups/kaora_backup_YYYYMMDD_HHMMSS.sql
```

### Teste de conectividade
```bash
./scripts/test-db-connection.sh
# Verifica se o PostgreSQL está acessível
```

---

## 🔧 Configuração Inicial

### Pré-requisitos
- Docker e Docker Compose V2 instalados
- Arquivo `.env` configurado
- Acesso ao cluster PostgreSQL externo
- Rede `proxy-net` (será criada automaticamente)

### Variáveis essenciais no .env
```bash
# Banco de dados (cluster externo)
DATABASE_URL="postgresql://user:pass@host:5432/kaora"

# Autenticação
NEXTAUTH_SECRET="sua_chave_secreta_aqui"
NEXTAUTH_URL="https://seu-dominio.com"

# Redis (será criado automaticamente)
REDIS_URL="redis://redis:6379"
```

---

## 📊 Monitoramento

### Status dos serviços
```bash
./scripts/kaora.sh
# Opção: 7) Ver status dos serviços
```

### Análise de performance
```bash
./scripts/analyze-docker.sh
# Mostra uso de espaço e otimizações possíveis
```

### Logs em tempo real
```bash
# Logs da aplicação
docker compose -f docker-compose.prod.yml logs -f kaora-app

# Logs do Redis
docker compose -f docker-compose.prod.yml logs -f redis
```

---

## 🆘 Solução de Problemas

### Aplicação não inicia
1. Verificar logs: `docker compose -f docker-compose.prod.yml logs kaora-app`
2. Testar conexão BD: `./scripts/test-db-connection.sh`
3. Verificar .env: `./scripts/kaora.sh` → opção 11

### Erro de build
1. Limpar cache: `docker system prune -f`
2. Build otimizado: `./scripts/build-optimize.sh`
3. Verificar espaço em disco: `df -h`

### Performance lenta
1. Analisar containers: `./scripts/analyze-docker.sh`
2. Verificar logs: `docker stats`
3. Otimizar imagens: `docker image prune -f`

---

## 🎯 Dicas de Uso

### Para desenvolvedores
- Use `./scripts/kaora.sh` para operações interativas
- Automatize com `./scripts/deploy.sh rebuild kaora-app`
- Backup antes de atualizações importantes

### Para administradores
- Execute backup semanal: `./scripts/backup.sh`
- Monitore logs regularmente
- Mantenha imagens Docker limpas

### Para CI/CD
```bash
# Em pipelines automatizados
./scripts/deploy.sh rebuild kaora-app --no-confirm
```

---

## 📝 Logs e Backup

### Localização dos arquivos
- **Backups**: `./backups/` (criado automaticamente)
- **Logs Docker**: `docker compose logs`
- **Logs aplicação**: `/app/.next/standalone/logs/` (dentro do container)

### Retenção recomendada
- **Backups**: 30 dias (configurável em `backup.sh`)
- **Logs Docker**: 7 dias (configurável em `docker-compose.prod.yml`)

---

💡 **Dica**: Para novos usuários, sempre comece com `./scripts/kaora.sh` para explorar todas as opções disponíveis!
