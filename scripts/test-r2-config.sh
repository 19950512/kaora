#!/bin/bash

# ==========================================
# TESTE CONFIGURAÇÃO R2 - KAORA
# ==========================================
# Script para validar configuração do Cloudflare R2

clear
set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[R2-TEST]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log "🔍 Iniciando validação da configuração R2..."

# Verificar se arquivo .env existe
if [ ! -f ".env" ]; then
    error "Arquivo .env não encontrado!"
    exit 1
fi

# Carregar variáveis do .env
source .env

echo ""
log "📋 Verificando variáveis de ambiente R2..."

# Verificar variáveis obrigatórias
MISSING_VARS=()

if [ -z "$R2_ACCOUNT_ID" ]; then
    MISSING_VARS+=("R2_ACCOUNT_ID")
else
    info "✅ R2_ACCOUNT_ID: ${R2_ACCOUNT_ID:0:8}..."
fi

if [ -z "$R2_ACCESS_KEY_ID" ]; then
    MISSING_VARS+=("R2_ACCESS_KEY_ID")
else
    info "✅ R2_ACCESS_KEY_ID: ${R2_ACCESS_KEY_ID:0:8}..."
fi

if [ -z "$R2_SECRET_ACCESS_KEY" ]; then
    MISSING_VARS+=("R2_SECRET_ACCESS_KEY")
else
    info "✅ R2_SECRET_ACCESS_KEY: ${R2_SECRET_ACCESS_KEY:0:8}..."
fi

if [ -z "$R2_BUCKET_NAME" ]; then
    MISSING_VARS+=("R2_BUCKET_NAME")
else
    info "✅ R2_BUCKET_NAME: $R2_BUCKET_NAME"
fi

if [ -z "$R2_PUBLIC_URL" ]; then
    MISSING_VARS+=("R2_PUBLIC_URL")
else
    info "✅ R2_PUBLIC_URL: $R2_PUBLIC_URL"
fi

# Se há variáveis faltando, mostrar e entrar em modo demo
if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo ""
    warn "⚠️ Variáveis de ambiente R2 não configuradas:"
    for var in "${MISSING_VARS[@]}"; do
        warn "   - $var"
    done
    echo ""
    info "🔧 Como configurar:"
    echo ""
    echo "1. No painel do Cloudflare R2:"
    echo "   - Crie um bucket R2"
    echo "   - Gere um token de API R2"
    echo ""
    echo "2. Adicione no arquivo .env:"
    echo "   R2_ACCOUNT_ID=seu_account_id"
    echo "   R2_ACCESS_KEY_ID=sua_access_key"
    echo "   R2_SECRET_ACCESS_KEY=sua_secret_key"
    echo "   R2_BUCKET_NAME=seu_bucket_name"
    echo "   R2_PUBLIC_URL=https://seu_bucket.r2.cloudflarestorage.com"
    echo ""
    warn "📋 Sistema funcionará em MODO DEMONSTRAÇÃO até configurar R2"
    exit 0
fi

echo ""
log "🌐 Testando conectividade com R2..."

# Testar conectividade usando curl
R2_ENDPOINT="https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com"

if curl -s --connect-timeout 10 --max-time 30 "$R2_ENDPOINT" >/dev/null 2>&1; then
    log "✅ Conectividade com R2 OK"
else
    warn "⚠️ Problema de conectividade com R2"
    warn "   Endpoint: $R2_ENDPOINT"
    warn "   Verifique firewall/proxy"
fi

echo ""
log "📊 Status da configuração R2:"
echo ""
if [ ${#MISSING_VARS[@]} -eq 0 ]; then
    log "✅ R2 configurado - uploads reais habilitados"
    log "📁 Bucket: $R2_BUCKET_NAME"
    log "🌐 URL pública: $R2_PUBLIC_URL"
else
    warn "⚠️ R2 em modo demonstração"
    warn "   URLs simuladas serão geradas"
    warn "   Arquivos não serão salvos fisicamente"
fi

echo ""
log "🎉 Validação concluída!"
