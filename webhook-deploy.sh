#!/bin/bash

# ==========================================
# WEBHOOK DEPLOY - KAORA
# ==========================================
# Script para ser usado em webhooks do GitHub
# ou pipelines de CI/CD

set -e

# Configurações
DEPLOY_LOG="/var/log/kaora-deploy.log"
LOCK_FILE="/tmp/kaora-deploy.lock"

# Função de log
log_webhook() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$DEPLOY_LOG"
}

# Verificar se já existe um deploy em andamento
if [ -f "$LOCK_FILE" ]; then
    log_webhook "⚠️ Deploy já em andamento. Abortando."
    exit 1
fi

# Criar lock file
touch "$LOCK_FILE"

# Função de cleanup
cleanup() {
    rm -f "$LOCK_FILE"
}
trap cleanup EXIT

log_webhook "🚀 Iniciando deploy automático via webhook..."

# Verificar se estamos na pasta correta
if [ ! -f "deploy.sh" ]; then
    log_webhook "❌ Script deploy.sh não encontrado na pasta atual"
    exit 1
fi

# Verificar branch (opcional - só deploy da main)
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
    log_webhook "⚠️ Deploy apenas da branch main. Branch atual: $CURRENT_BRANCH"
    exit 0
fi

# Verificar se há mudanças no código da aplicação
if git diff --name-only HEAD~1 HEAD | grep -E "(web/|packages/|Dockerfile|docker-compose\.prod\.yml)" > /dev/null; then
    log_webhook "📦 Mudanças detectadas na aplicação. Fazendo rebuild..."
    
    # Executar deploy da aplicação
    if ./deploy.sh rebuild kaora-app >> "$DEPLOY_LOG" 2>&1; then
        log_webhook "✅ Deploy da aplicação concluído com sucesso"
        
        # Notificar sucesso (opcional - configure seu webhook/slack/discord)
        # curl -X POST -H 'Content-type: application/json' \
        #   --data '{"text":"✅ Deploy do Kaora concluído com sucesso!"}' \
        #   YOUR_WEBHOOK_URL
        
    else
        log_webhook "❌ Falha no deploy da aplicação"
        
        # Notificar falha (opcional)
        # curl -X POST -H 'Content-type: application/json' \
        #   --data '{"text":"❌ Falha no deploy do Kaora! Verifique os logs."}' \
        #   YOUR_WEBHOOK_URL
        
        exit 1
    fi
else
    log_webhook "ℹ️ Nenhuma mudança relevante detectada. Deploy não necessário."
fi

log_webhook "🎉 Processo de deploy automático finalizado"
