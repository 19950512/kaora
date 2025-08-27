#!/bin/bash

# ===========================================
# KAORA - QUICK START
# ===========================================
# Script de entrada principal para o sistema Kaora

clear

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Logo
echo -e "${PURPLE}"
echo "██╗  ██╗ █████╗  ██████╗ ██████╗  █████╗ "
echo "██║ ██╔╝██╔══██╗██╔═══██╗██╔══██╗██╔══██╗"
echo "█████╔╝ ███████║██║   ██║██████╔╝███████║"
echo "██╔═██╗ ██╔══██║██║   ██║██╔══██╗██╔══██║"
echo "██║  ██╗██║  ██║╚██████╔╝██║  ██║██║  ██║"
echo "╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝"
echo -e "${NC}"
echo -e "${BLUE}Sistema de Deploy e Gerenciamento${NC}"
echo ""

echo -e "${GREEN}🚀 Bem-vindo ao Kaora!${NC}"
echo ""
echo -e "${YELLOW}📁 Scripts organizados em: ./scripts/${NC}"
echo ""

# Verificar se a pasta scripts existe
if [ ! -d "scripts" ]; then
    echo -e "${RED}❌ Pasta 'scripts' não encontrada!${NC}"
    echo "Execute este comando na pasta raiz do projeto Kaora"
    exit 1
fi

echo "Escolha uma opção:"
echo ""
echo "🎯 RECOMENDADO (Interface Completa):"
echo "  1) Abrir menu interativo completo"
echo ""
echo "⚡ AÇÕES RÁPIDAS:"
echo "  2) Deploy inicial (primeira vez)"
echo "  3) Atualizar aplicação" 
echo "  4) Ver status dos serviços"
echo "  5) Backup dos dados"
echo ""
echo "📖 DOCUMENTAÇÃO:"
echo "  6) Abrir guia de scripts (README)"
echo "  7) Ver comandos rápidos"
echo ""
echo "  0) Sair"
echo ""
echo -n "Digite sua escolha [0-7]: "

read -r choice

case $choice in
    1)
        echo ""
        echo -e "${GREEN}🎯 Abrindo menu interativo completo...${NC}"
        ./scripts/kaora.sh
        ;;
    2)
        echo ""
        echo -e "${GREEN}🚀 Executando deploy inicial...${NC}"
        ./scripts/deploy.sh initial
        ;;
    3)
        echo ""
        echo -e "${GREEN}⚡ Atualizando aplicação...${NC}"
        ./scripts/deploy.sh rebuild kaora-app
        ;;
    4)
        echo ""
        echo -e "${GREEN}📊 Verificando status dos serviços...${NC}"
        docker compose -f docker-compose.prod.yml ps
        ;;
    5)
        echo ""
        echo -e "${GREEN}💾 Executando backup...${NC}"
        ./scripts/backup.sh
        ;;
    6)
        echo ""
        echo -e "${BLUE}📖 Abrindo guia de scripts...${NC}"
        if command -v less >/dev/null 2>&1; then
            less scripts/README.md
        elif command -v more >/dev/null 2>&1; then
            more scripts/README.md
        else
            cat scripts/README.md
        fi
        ;;
    7)
        echo ""
        echo -e "${BLUE}📋 Comandos rápidos:${NC}"
        echo ""
        echo "• Menu completo:       ./scripts/kaora.sh"
        echo "• Deploy inicial:      ./scripts/deploy.sh initial"
        echo "• Atualizar app:       ./scripts/deploy.sh rebuild kaora-app"
        echo "• Backup:              ./scripts/backup.sh"
        echo "• Status:              docker compose -f docker-compose.prod.yml ps"
        echo "• Logs:                docker compose -f docker-compose.prod.yml logs -f"
        echo ""
        ;;
    0)
        echo ""
        echo -e "${GREEN}👋 Até mais!${NC}"
        exit 0
        ;;
    *)
        echo ""
        echo -e "${YELLOW}⚠️ Opção inválida. Tente novamente.${NC}"
        exit 1
        ;;
esac
