# Deploy em Produção - Kaora

Este guia detalha como fazer o deploy da aplicação Kaora em produção usando Docker com PostgreSQL externo.

## 📋 Pré-requisitos

- Docker e Docker Compose instalados
- Rede externa `proxy-net` criada no Docker
- Cluster PostgreSQL externo configurado e acessível
- Domínio configurado apontando para o servidor
- Certificados SSL configurados (recomendado usar Traefik ou Nginx Proxy Manager)

## 🗄️ Configuração do Banco de Dados

### PostgreSQL Externo
Esta configuração assume que você possui um cluster PostgreSQL externo (AWS RDS, Google Cloud SQL, Azure Database, etc.).

**Requisitos do banco:**
- PostgreSQL 13+ 
- Extensões habilitadas: `uuid-ossp`, `pg_trgm`
- SSL habilitado para conexões seguras

### Inicialização do Schema
Execute o script de inicialização no seu cluster PostgreSQL:

```bash
psql -h seu-cluster-postgres.com -U usuario -d kaora -f docker/init-db.sql
```

## 🚀 Configuração

### 1. Criar a rede externa

```bash
docker network create proxy-net
```

### 2. Configurar variáveis de ambiente

```bash
# Copie o arquivo de exemplo
cp .env.production .env

# Edite o arquivo .env com suas configurações
nano .env
```

**Variáveis obrigatórias:**
- `DATABASE_URL`: URL completa de conexão com o cluster PostgreSQL externo
- `REDIS_PASSWORD`: Senha segura para o Redis
- `NEXTAUTH_SECRET`: Chave secreta de 32+ caracteres
- `NEXTAUTH_URL`: URL completa da aplicação
- `DOMAIN`: Seu domínio

**Exemplo de DATABASE_URL:**
```
DATABASE_URL=postgresql://usuario:senha@seu-cluster.com:5432/kaora?sslmode=require
```

### 3. Deploy

```bash
# Deploy inicial completo (primeira vez)
./deploy.sh initial

# Ou rebuild de um serviço específico (atualizações)
./deploy.sh rebuild kaora-app
./deploy.sh rebuild redis
```

**Opções disponíveis:**
- `initial` ou `full`: Deploy completo de todos os serviços
- `rebuild <serviço>`: Rebuild de um serviço específico sem downtime

## 📊 Monitoramento

### Verificar status dos serviços

```bash
docker compose -f docker-compose.prod.yml ps
```

### Ver logs

```bash
# Logs da aplicação
docker compose -f docker-compose.prod.yml logs -f kaora-app

# Logs do Redis
docker compose -f docker-compose.prod.yml logs -f redis
```

### Health checks

```bash
# Verificar saúde dos serviços
docker compose -f docker-compose.prod.yml exec kaora-app curl -f http://localhost:3000/api/health
```

## 🔐 Segurança

### Configurações recomendadas:

1. **Senhas fortes**: Use senhas com pelo menos 32 caracteres
2. **Firewall**: Configure firewall para expor apenas portas necessárias
3. **SSL/TLS**: Use HTTPS com certificados válidos
4. **Backup**: Configure backup automático do PostgreSQL

### Backup do banco de dados

**Nota:** O backup agora funciona com PostgreSQL externo e requer `pg_dump` instalado no servidor.

```bash
# Instalar postgresql-client se necessário
sudo apt-get install postgresql-client

# Criar backup automático
./backup.sh

# Backup manual
pg_dump -h seu-cluster.com -U usuario -d kaora > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
psql -h seu-cluster.com -U usuario -d kaora < backup.sql
```

## 🔄 Atualizações

### Deploy com zero downtime:

```bash
# Atualizar apenas a aplicação (mais comum)
./deploy.sh rebuild kaora-app

# Atualizar apenas o Redis (raramente necessário)
./deploy.sh rebuild redis
```

### Deploy completo (quando necessário):

```bash
# Deploy completo (para mudanças na infraestrutura)
./deploy.sh initial
```

**O script automaticamente:**
- Faz `git pull` das últimas mudanças
- Rebuilda a imagem sem cache
- Para o container antigo
- Remove a imagem antiga
- Sobe o novo container
- Verifica health checks
- Mostra status final

### Deploy automático via webhook:

```bash
# Para configurar deploy automático via GitHub webhook
./webhook-deploy.sh
```

**Recursos do webhook:**
- Verifica se já existe deploy em andamento
- Deploy apenas da branch `main`
- Detecta mudanças relevantes automaticamente
- Log de todas as operações
- Suporte a notificações (Slack/Discord)

## 📁 Estrutura de volumes

```
/var/lib/docker/volumes/
└── kaora_redis_data/        # Dados do Redis
```

**Nota:** O PostgreSQL é externo, não há volume local para banco de dados.

## 🌐 Proxy Reverso

O docker compose está configurado para funcionar com Traefik ou Nginx Proxy Manager através da rede `proxy-net`.

### Labels Traefik incluídos:

- Habilitação automática
- Redirecionamento para HTTPS
- Certificados SSL automáticos via Let's Encrypt
- Roteamento por domínio

## ⚠️ Troubleshooting

### Problemas comuns:

1. **Erro de conexão com banco**: Verifique se o cluster PostgreSQL está acessível e as credenciais estão corretas
2. **Erro 502**: Verifique se a aplicação está respondendo na porta 3000
3. **Erro de SSL**: Verifique se os certificados estão válidos e o domínio configurado corretamente
4. **Erro de DNS**: Verifique se o hostname do cluster PostgreSQL está resolvendo corretamente

### Comandos úteis:

```bash
# Restart completo
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d

# Limpar volumes (⚠️ CUIDADO: apaga dados)
docker compose -f docker-compose.prod.yml down -v

# Ver uso de recursos
docker stats
```

## 📞 Suporte

Em caso de problemas, verifique:
1. Logs dos containers
2. Status dos health checks
3. Configurações de rede
4. Variáveis de ambiente
