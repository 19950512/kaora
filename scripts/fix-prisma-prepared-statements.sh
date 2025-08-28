#!/bin/bash

# ==========================================
# FIX PRISMA PREPARED STATEMENTS ERROR
# ==========================================
# Script para resolver o erro "prepared statement already exists"

clear
set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[FIX-PRISMA]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log "🔧 Iniciando correção do erro de prepared statements do Prisma..."

# 1. Parar a aplicação
log "1. Parando aplicação Kaora..."
docker compose -f docker-compose.prod.yml stop kaora-app

# 2. Reiniciar PostgreSQL para limpar prepared statements
log "2. Reiniciando PostgreSQL para limpar prepared statements..."
docker compose -f docker-compose.prod.yml restart postgres

# 3. Aguardar PostgreSQL ficar pronto
log "3. Aguardando PostgreSQL ficar pronto..."
sleep 10

# 4. Verificar se PostgreSQL está respondendo
log "4. Verificando PostgreSQL..."
for i in {1..10}; do
    if docker compose -f docker-compose.prod.yml exec -T postgres pg_isready -U kaora_user >/dev/null 2>&1; then
        log "✅ PostgreSQL está pronto!"
        break
    fi
    echo -n "."
    sleep 2
    
    if [[ $i -eq 10 ]]; then
        error "❌ PostgreSQL não ficou pronto"
        exit 1
    fi
done

# 5. Aplicar correção do schema se necessário
log "5. Aplicando correção do schema (logoUrl opcional)..."
docker compose -f docker-compose.prod.yml exec -T postgres psql -U kaora_user -d kaora -c "
    ALTER TABLE business ALTER COLUMN logo_url DROP NOT NULL;
" || warn "Schema já pode estar atualizado"

# 6. Subir aplicação novamente
log "6. Subindo aplicação Kaora..."
docker compose -f docker-compose.prod.yml up -d kaora-app

# 7. Aguardar aplicação ficar pronta
log "7. Aguardando aplicação ficar pronta..."
sleep 15

# 8. Verificar se aplicação está respondendo
log "8. Verificando aplicação..."
for i in {1..20}; do
    if docker compose -f docker-compose.prod.yml exec -T kaora-app curl -f http://kaora-app:9990/api/health >/dev/null 2>&1; then
        log "✅ Aplicação está respondendo!"
        break
    fi
    echo -n "."
    sleep 3
    
    if [[ $i -eq 20 ]]; then
        error "❌ Aplicação não respondeu dentro do tempo limite"
        warn "Verificando logs:"
        docker compose -f docker-compose.prod.yml logs --tail=20 kaora-app
        exit 1
    fi
done

log "🎉 Correção concluída com sucesso!"
log "📊 Status dos serviços:"
docker compose -f docker-compose.prod.yml ps
