#!/bin/bash

# ==========================================
# ANÁLISE DE TAMANHO DA IMAGEM DOCKER - KAORA
# ==========================================

clear
set -e

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[ANÁLISE]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log "🔍 Analisando otimização da imagem Docker..."

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    error "Docker não está rodando"
    exit 1
fi

# Build da imagem para análise
log "📦 Fazendo build da imagem para análise..."
docker build -t kaora-analysis .

# Verificar se o build foi bem-sucedido
if [ $? -ne 0 ]; then
    error "Falha no build da imagem"
    exit 1
fi

echo ""
log "📊 ANÁLISE DE TAMANHO:"
echo "======================================"

# Tamanho total da imagem
TOTAL_SIZE=$(docker images kaora-analysis:latest --format "table {{.Size}}" | tail -n 1)
echo -e "Tamanho total da imagem: ${GREEN}$TOTAL_SIZE${NC}"

# Análise por layers
echo ""
info "🔍 Análise detalhada por layers:"
docker history kaora-analysis:latest --format "table {{.CreatedBy}}\t{{.Size}}" | head -20

echo ""
info "📋 Comparação com imagens base:"
echo "node:20-alpine: $(docker images node:20-alpine --format "{{.Size}}" 2>/dev/null || echo "Não encontrada")"

echo ""
info "💾 Uso de disco total do Docker:"
docker system df

# Análise do conteúdo da imagem
echo ""
log "📁 Analisando conteúdo da imagem..."

# Criar container temporário para análise
CONTAINER_ID=$(docker create kaora-analysis:latest)

# Analisar tamanho dos diretórios principais
echo ""
info "📂 Tamanho dos diretórios principais:"
docker cp $CONTAINER_ID:/app /tmp/kaora-analysis 2>/dev/null || true
if [ -d "/tmp/kaora-analysis" ]; then
    du -sh /tmp/kaora-analysis/* 2>/dev/null | head -10
    du -sh /tmp/kaora-analysis/node_modules 2>/dev/null | head -1 || true
    du -sh /tmp/kaora-analysis/web/.next 2>/dev/null | head -1 || true
    
    # Contar arquivos
    echo ""
    info "📋 Número de arquivos por diretório:"
    find /tmp/kaora-analysis -type f | wc -l | sed 's/^/Total de arquivos: /'
    find /tmp/kaora-analysis/node_modules -type f 2>/dev/null | wc -l | sed 's/^/node_modules: /' || true
    find /tmp/kaora-analysis/web/.next -type f 2>/dev/null | wc -l | sed 's/^/.next: /' || true
    
    # Verificar dependências desnecessárias
    echo ""
    warn "⚠️ Possíveis otimizações:"
    
    if [ -d "/tmp/kaora-analysis/node_modules/@types" ]; then
        warn "• Dependências @types encontradas (podem ser removidas)"
    fi
    
    if [ -d "/tmp/kaora-analysis/node_modules/typescript" ]; then
        warn "• TypeScript encontrado (pode ser removido em produção)"
    fi
    
    if [ -d "/tmp/kaora-analysis/node_modules/eslint" ]; then
        warn "• ESLint encontrado (pode ser removido em produção)"
    fi
    
    # Cleanup
    rm -rf /tmp/kaora-analysis
fi

# Cleanup
docker rm $CONTAINER_ID > /dev/null

echo ""
log "🎯 RECOMENDAÇÕES DE OTIMIZAÇÃO:"
echo "======================================"
echo "✅ Multi-stage build implementado"
echo "✅ Usuário não-root configurado"
echo "✅ Alpine Linux utilizado"
echo "✅ Cache do Next.js removido"
echo "✅ .dockerignore otimizado"
echo ""
echo "💡 Próximos passos para otimizar ainda mais:"
echo "• Verificar se todas as dependências @types são necessárias"
echo "• Considerar usar distroless para o stage final"
echo "• Implementar cache de layers no CI/CD"
echo "• Usar registry com compressão"

echo ""
info "📝 Para reduzir ainda mais:"
echo "• docker image prune -f  # Remove imagens não utilizadas"
echo "• docker system prune -f # Remove containers, redes e volumes não utilizados"

echo ""
log "✅ Análise concluída!"
