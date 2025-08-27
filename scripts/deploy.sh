#!/bin/bash

# ==========================================
# SCRIPT DE DEPLOY PRODUÇÃO - KAORA
# ==========================================

clear
set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[DEPLOY]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_docker() {
    if ! docker info > /dev/null 2>&1; then
        error "Docker não está rodando. Por favor, inicie o Docker."
        exit 1
    fi
}

check_env() {
    if [ ! -f ".env" ]; then
        error "Arquivo .env não encontrado!"
        error "Copie o arquivo .env.production para .env e configure as variáveis"
        exit 1
    fi
    source .env
    if [ -z "$DATABASE_URL" ]; then
        error "Configure a DATABASE_URL no arquivo .env"
        exit 1
    fi
    if [ -z "$NEXTAUTH_SECRET" ] || [ "$NEXTAUTH_SECRET" = "sua_chave_secreta_nextauth_de_32_caracteres_ou_mais" ]; then
        error "Configure uma chave secreta forte para NEXTAUTH_SECRET em .env"
        exit 1
    fi
}

check_network() {
    if ! docker network ls | grep -q "proxy-net"; then
        warn "Rede proxy-net não encontrada. Criando..."
        docker network create proxy-net
        log "Rede proxy-net criada com sucesso"
    fi
}

# Função para realizar o rebuild sem downtime
rebuild_prod() {
    SERVICE_NAME=$1
    if [ -z "$SERVICE_NAME" ]; then
        error "Nome do serviço não especificado. Use: $0 rebuild <nome_serviço>"
        error "Serviços disponíveis: kaora-app, redis"
        exit 1
    fi

    IMAGE_NAME="kaora-${SERVICE_NAME}"

    log "Atualizando código da aplicação com git pull origin main..."
    git fetch origin main
    git reset --hard origin/main
    git pull origin main

    check_env

    log "Construindo nova imagem sem cache para o serviço ${SERVICE_NAME}..."
    docker compose -f docker-compose.prod.yml build --no-cache ${SERVICE_NAME}

    # Verifica se o build foi bem-sucedido
    if [ $? -ne 0 ]; then
        error "O build falhou. Abortando o deploy."
        exit 1
    fi

    # Agora que o build foi bem-sucedido, vamos parar o serviço antigo e iniciar o novo
    warn "Parando o container do serviço ${SERVICE_NAME}..."
    docker compose -f docker-compose.prod.yml stop ${SERVICE_NAME}

    warn "Removendo a imagem antiga (se existir) do serviço ${SERVICE_NAME}..."
    docker image rm ${IMAGE_NAME}:latest || true

    log "Subindo o novo container para o serviço ${SERVICE_NAME}..."
    docker compose -f docker-compose.prod.yml up -d ${SERVICE_NAME}

    # Dando tempo para o novo container iniciar
    log "Aguardando a aplicação iniciar..."
    sleep 10

    # Verificações específicas do Kaora
    if [ "$SERVICE_NAME" = "kaora-app" ]; then
        log "Verificando health check da aplicação..."
        for i in {1..30}; do
            if docker compose -f docker-compose.prod.yml exec -T kaora-app curl -f http://kaora-app:9990/api/health >/dev/null 2>&1; then
                log "✅ Aplicação está respondendo!"
                break
            fi
            echo -n "."
            sleep 2
            
            if [[ $i -eq 30 ]]; then
                error "❌ Aplicação não respondeu dentro do tempo limite"
                warn "Verificando logs da aplicação:"
                docker compose -f docker-compose.prod.yml logs --tail=20 kaora-app
                exit 1
            fi
        done
    fi

    if [ "$SERVICE_NAME" = "redis" ]; then
        log "Verificando Redis..."
        for i in {1..15}; do
            if docker compose -f docker-compose.prod.yml exec -T redis redis-cli ping >/dev/null 2>&1; then
                log "✅ Redis está respondendo!"
                break
            fi
            echo -n "."
            sleep 2
            
            if [[ $i -eq 15 ]]; then
                error "❌ Redis não respondeu dentro do tempo limite"
                exit 1
            fi
        done
    fi

    # Verifica se o novo container está funcionando corretamente
    docker compose -f docker-compose.prod.yml ps

    log "🎉 Rebuild e deploy concluídos com sucesso para o serviço ${SERVICE_NAME}!"
}

# Função para deploy inicial completo
deploy_initial() {
    log "🚀 Iniciando deploy inicial completo..."
    
    check_docker
    check_env
    check_network

    # Parar containers existentes (se houver)
    warn "Parando containers existentes (se houver)..."
    docker compose -f docker-compose.prod.yml down || true

    # Build de todos os serviços
    log "Construindo todos os serviços..."
    docker compose -f docker-compose.prod.yml build --no-cache

    # Subir os serviços
    log "Subindo todos os serviços..."
    docker compose -f docker-compose.prod.yml up -d

    # Aguardar serviços ficarem prontos
    log "Aguardando serviços ficarem prontos..."
    sleep 15

    # Verificar Redis
    log "Verificando Redis..."
    for i in {1..15}; do
        if docker compose -f docker-compose.prod.yml exec -T redis redis-cli ping >/dev/null 2>&1; then
            log "✅ Redis está pronto!"
            break
        fi
        echo -n "."
        sleep 2
    done

    # Verificar aplicação
    log "Verificando aplicação..."
    for i in {1..30}; do
        if docker compose -f docker-compose.prod.yml exec -T kaora-app curl -f http://kaora-app:9990/api/health >/dev/null 2>&1; then
            log "✅ Aplicação está pronta!"
            break
        fi
        echo -n "."
        sleep 2
        
        if [[ $i -eq 30 ]]; then
            error "❌ Aplicação não respondeu dentro do tempo limite"
            warn "Verificando logs da aplicação:"
            docker compose -f docker-compose.prod.yml logs --tail=20 kaora-app
            exit 1
        fi
    done

    # Mostrar status final
    echo ""
    log "📊 Status dos serviços:"
    docker compose -f docker-compose.prod.yml ps

    echo ""
    log "💾 Uso de volumes:"
    docker system df

    echo ""
    log "🎉 Deploy inicial concluído com sucesso!"
    log "Aplicação rodando em: https://$(grep DOMAIN .env | cut -d'=' -f2 2>/dev/null || echo 'kaora.com.br')"
    log "Para ver os logs: docker compose -f docker-compose.prod.yml logs -f"
}

case "$1" in
    rebuild)
        check_docker
        rebuild_prod "$2"
        ;;
    initial|full)
        deploy_initial
        ;;
    *)
        echo "Uso:"
        echo "  $0 initial          - Deploy inicial completo"
        echo "  $0 rebuild <serviço> - Rebuild de um serviço específico"
        echo ""
        echo "Serviços disponíveis:"
        echo "  kaora-app - Aplicação Next.js"
        echo "  redis     - Cache Redis"
        exit 1
        ;;
esac
