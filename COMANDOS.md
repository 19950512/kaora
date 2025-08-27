# Comandos Úteis - Deploy Kaora

## 🚀 Fluxo Principal (90% dos casos)

```bash
# Atualização de código (mais comum)
git push origin main
./deploy.sh rebuild kaora-app

# Primeira instalação
./deploy.sh initial

# Backup semanal
./backup.sh
```

## 🔄 Deploy Completo

```bash
# COMANDOS ESSENCIAIS

## Quick Start (Interface Interativa)

### Script principal com menu
```bash
./scripts/kaora.sh
```
Este é o script principal que oferece uma interface interativa com todas as opções.

## Deploy de Produção

### Deploy inicial (primeira vez)
```bash
./scripts/deploy.sh initial
```

### Atualizar aplicação
```bash
./scripts/deploy.sh rebuild kaora-app
```

### Atualizar só o Redis
```bash
./scripts/deploy.sh rebuild redis
```

## Manutenção

### Backup do banco
```bash
./scripts/backup.sh
```

### Testar conexão com banco
```bash
./scripts/test-db-connection.sh
```

### Análise de otimização Docker
```bash
./scripts/analyze-docker.sh
```

# Deploy automático via webhook
./webhook-deploy.sh
```

## 🔍 Monitoramento

```bash
# Ver status dos serviços
docker compose -f docker-compose.prod.yml ps

# Ver logs em tempo real
docker compose -f docker-compose.prod.yml logs -f kaora-app
docker compose -f docker-compose.prod.yml logs -f redis

# Ver logs das últimas 50 linhas
docker compose -f docker-compose.prod.yml logs --tail=50 kaora-app

# Testar health check
curl http://localhost:3000/api/health
```

## 🛠️ Manutenção

```bash
# Backup automático
./backup.sh

# Testar conexão com banco externo
./test-db-connection.sh

# Validar compose files
./validate-compose.sh

# Analisar otimização da imagem Docker
./analyze-docker.sh

# Build otimizado com comparação
./build-optimize.sh

# Restart completo (se necessário)
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d

# Limpar imagens não utilizadas
docker image prune -f

# Build com diferentes Dockerfiles
docker build -f Dockerfile -t kaora:current .
docker build -f Dockerfile.distroless -t kaora:distroless .
```

## 📊 Debug

```bash
# Entrar no container da aplicação
docker compose -f docker-compose.prod.yml exec kaora-app sh

# Entrar no Redis
docker compose -f docker-compose.prod.yml exec redis redis-cli

# Ver uso de recursos
docker stats

# Ver volumes
docker volume ls

# Ver redes
docker network ls
```

## 🔧 Configuração

```bash
# Editar variáveis de ambiente
nano .env

# Ver configuração do compose (sem executar)
docker compose -f docker-compose.prod.yml config

# Verificar se images foram buildadas
docker images | grep kaora
```
