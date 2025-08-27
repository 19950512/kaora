#!/bin/bash

# ==========================================
# QUICK START - KAORA
# ==========================================
# Script interativo para guiar o usuário

clear
set -e

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
NC='\033[0m'

logo() {
    echo -e "${PURPLE}"
    echo "██╗  ██╗ █████╗  ██████╗ ██████╗  █████╗ "
    echo "██║ ██╔╝██╔══██╗██╔═══██╗██╔══██╗██╔══██╗"
    echo "█████╔╝ ███████║██║   ██║██████╔╝███████║"
    echo "██╔═██╗ ██╔══██║██║   ██║██╔══██╗██╔══██║"
    echo "██║  ██╗██║  ██║╚██████╔╝██║  ██║██║  ██║"
    echo "╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝"
    echo -e "${NC}"
    echo -e "${BLUE}Deploy & Management System${NC}"
    echo ""
}

log() {
    echo -e "${GREEN}[KAORA]${NC} $1"
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

# Função para mostrar menu
show_menu() {
    echo -e "${YELLOW}Escolha uma opção:${NC}"
    echo ""
    echo "🚀 DEPLOY:"
    echo "  1) Deploy inicial (primeira vez)"
    echo "  2) Atualizar aplicação (mais comum)"
    echo "  3) Atualizar Redis"
    echo ""
    echo "🛠️ MANUTENÇÃO:"
    echo "  4) Backup dos dados"
    echo "  5) Testar conexão com banco"
    echo "  6) Ver logs da aplicação"
    echo "  7) Ver status dos serviços"
    echo ""
    echo "🔍 ANÁLISE:"
    echo "  8) Analisar otimização Docker"
    echo "  9) Limpar imagens Docker"
    echo ""
    echo "⚙️ CONFIGURAÇÃO:"
    echo " 10) Configurar ambiente (.env)"
    echo " 11) Validar configurações"
    echo ""
    echo "  0) Sair"
    echo ""
    echo -n "Digite sua escolha [0-11]: "
}

# Função para executar comando com confirmação
execute_with_confirm() {
    local command=$1
    local description=$2
    
    echo ""
    warn "Executar: $description"
    echo -e "${YELLOW}Comando: $command${NC}"
    echo -n "Continuar? (y/N): "
    read -r confirm
    
    if [[ $confirm =~ ^[Yy]$ ]]; then
        echo ""
        log "Executando: $description"
        eval "$command"
        echo ""
        log "✅ Concluído: $description"
    else
        warn "❌ Cancelado"
    fi
}

# Função principal
main() {
    logo
    
    # Verificar se estamos na pasta correta e ajustar caminhos
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
    
    if [ ! -f "$SCRIPT_DIR/deploy.sh" ]; then
        error "Scripts não encontrados na pasta scripts"
        error "Estrutura de pastas incorreta"
        exit 1
    fi
    
    # Mudar para a pasta raiz do projeto para os comandos docker
    cd "$PROJECT_ROOT"
    
    while true; do
        echo ""
        show_menu
        read -r choice
        
        case $choice in
            1)
                execute_with_confirm "$SCRIPT_DIR/deploy.sh initial" "Deploy inicial completo"
                ;;
            2)
                execute_with_confirm "$SCRIPT_DIR/deploy.sh rebuild kaora-app" "Atualizar aplicação"
                ;;
            3)
                execute_with_confirm "$SCRIPT_DIR/deploy.sh rebuild redis" "Atualizar Redis"
                ;;
            4)
                execute_with_confirm "$SCRIPT_DIR/backup.sh" "Backup dos dados"
                ;;
            5)
                execute_with_confirm "$SCRIPT_DIR/test-db-connection.sh" "Testar conexão com banco"
                ;;
            6)
                execute_with_confirm "docker compose -f docker-compose.prod.yml logs -f kaora-app" "Ver logs da aplicação"
                ;;
            7)
                execute_with_confirm "docker compose -f docker-compose.prod.yml ps" "Ver status dos serviços"
                ;;
            8)
                execute_with_confirm "$SCRIPT_DIR/analyze-docker.sh" "Analisar otimização Docker"
                ;;
            9)
                execute_with_confirm "docker system prune -f" "Limpar imagens Docker"
                ;;
            10)
                echo ""
                log "Configurando ambiente..."
                if [ ! -f ".env" ]; then
                    if [ -f ".env.production" ]; then
                        cp .env.production .env
                        log "Arquivo .env criado a partir de .env.production"
                    else
                        error "Arquivo .env.production não encontrado"
                        continue
                    fi
                fi
                
                echo -n "Abrir editor para editar .env? (y/N): "
                read -r edit_env
                if [[ $edit_env =~ ^[Yy]$ ]]; then
                    nano .env || vim .env || echo "Editor não encontrado"
                fi
                ;;
            11)
                echo ""
                log "Validando configurações..."
                
                # Verificar .env
                if [ -f ".env" ]; then
                    log "✅ Arquivo .env existe"
                    
                    if grep -q "DATABASE_URL=" .env && ! grep -q "DATABASE_URL=$" .env; then
                        log "✅ DATABASE_URL configurada"
                    else
                        warn "⚠️ DATABASE_URL não configurada"
                    fi
                    
                    if grep -q "NEXTAUTH_SECRET=" .env && ! grep -q "NEXTAUTH_SECRET=sua_chave" .env; then
                        log "✅ NEXTAUTH_SECRET configurada"
                    else
                        warn "⚠️ NEXTAUTH_SECRET não configurada"
                    fi
                else
                    error "❌ Arquivo .env não existe"
                fi
                
                # Verificar Docker
                if docker info > /dev/null 2>&1; then
                    log "✅ Docker está rodando"
                else
                    error "❌ Docker não está rodando"
                fi
                
                # Verificar rede proxy-net
                if docker network ls | grep -q "proxy-net"; then
                    log "✅ Rede proxy-net existe"
                else
                    warn "⚠️ Rede proxy-net não existe (será criada no deploy)"
                fi
                ;;
            0)
                echo ""
                log "👋 Saindo... Até mais!"
                exit 0
                ;;
            *)
                error "Opção inválida. Tente novamente."
                ;;
        esac
        
        echo ""
        echo -n "Pressione Enter para continuar..."
        read -r
    done
}

# Executar função principal
main
