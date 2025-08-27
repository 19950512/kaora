#!/bin/bash

# ==========================================
# BUILD OTIMIZADO COM ANÁLISE - KAORA
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
    echo -e "${GREEN}[BUILD]${NC} $1"
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

# Função para formatar tamanho
format_size() {
    echo "$1" | numfmt --to=iec 2>/dev/null || echo "$1"
}

# Função para build e análise
build_and_analyze() {
    DOCKERFILE=$1
    TAG=$2
    DESCRIPTION=$3
    
    log "🏗️ Fazendo build: $DESCRIPTION"
    log "📄 Dockerfile: $DOCKERFILE"
    
    START_TIME=$(date +%s)
    
    if docker build -f "$DOCKERFILE" -t "$TAG" . --quiet; then
        END_TIME=$(date +%s)
        BUILD_TIME=$((END_TIME - START_TIME))
        
        SIZE=$(docker images "$TAG" --format "{{.Size}}")
        SIZE_BYTES=$(docker images "$TAG" --format "{{.Size}}" | sed 's/[^0-9]//g')
        
        echo "✅ Build concluído em ${BUILD_TIME}s"
        echo "📦 Tamanho: $SIZE"
        echo ""
        
        # Retornar informações para comparação
        echo "$TAG|$SIZE|$BUILD_TIME|$DESCRIPTION"
    else
        error "❌ Falha no build de $DESCRIPTION"
        return 1
    fi
}

log "🚀 Iniciando builds otimizados do Kaora..."

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    error "Docker não está rodando"
    exit 1
fi

# Array para armazenar resultados
RESULTS=()

echo ""
log "📊 COMPARAÇÃO DE DOCKERFILES:"
echo "======================================"

# Build 1: Dockerfile atual
if [ -f "Dockerfile" ]; then
    RESULT=$(build_and_analyze "Dockerfile" "kaora:current" "Dockerfile Atual")
    RESULTS+=("$RESULT")
fi

# Build 2: Dockerfile distroless (se existir)
if [ -f "Dockerfile.distroless" ]; then
    RESULT=$(build_and_analyze "Dockerfile.distroless" "kaora:distroless" "Dockerfile Distroless")
    RESULTS+=("$RESULT")
fi

# Análise comparativa
echo ""
log "📈 ANÁLISE COMPARATIVA:"
echo "======================================"

for result in "${RESULTS[@]}"; do
    IFS='|' read -r tag size build_time description <<< "$result"
    printf "%-20s | %-10s | %-8s | %s\n" "$description" "$size" "${build_time}s" "$tag"
done

# Encontrar a menor imagem
if [ ${#RESULTS[@]} -gt 1 ]; then
    echo ""
    SMALLEST=""
    SMALLEST_SIZE=999999999999
    
    for result in "${RESULTS[@]}"; do
        IFS='|' read -r tag size build_time description <<< "$result"
        # Extrair número para comparação (simplificado)
        SIZE_NUM=$(echo "$size" | sed 's/[^0-9.]//g')
        
        if (( $(echo "$SIZE_NUM < $SMALLEST_SIZE" | bc -l 2>/dev/null || echo "0") )); then
            SMALLEST_SIZE=$SIZE_NUM
            SMALLEST="$description"
        fi
    done
    
    if [ -n "$SMALLEST" ]; then
        log "🏆 Menor imagem: $SMALLEST"
    fi
fi

# Recomendações
echo ""
log "💡 RECOMENDAÇÕES:"
echo "======================================"
echo "✅ Use multi-stage builds"
echo "✅ Remova dependências de desenvolvimento"
echo "✅ Use .dockerignore otimizado"
echo "✅ Remova arquivos desnecessários"
echo "✅ Use Alpine Linux ou Distroless"
echo ""
echo "🔧 Para otimizar ainda mais:"
echo "• Use BuildKit para cache de layers"
echo "• Implemente cache de registry"
echo "• Use compressão de imagens"
echo "• Monitore vulnerabilidades com Snyk/Trivy"

# Cleanup opcional
echo ""
read -p "Deseja remover as imagens de teste? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log "🧹 Limpando imagens de teste..."
    for result in "${RESULTS[@]}"; do
        IFS='|' read -r tag size build_time description <<< "$result"
        docker rmi "$tag" 2>/dev/null || true
    done
    log "✅ Cleanup concluído"
fi

echo ""
log "🎯 Build e análise concluídos!"
