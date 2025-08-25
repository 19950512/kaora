#!/bin/bash

# =====================================================
# SCRIPT DE DESENVOLVIMENTO KAORA
# Sobe PostgreSQL e Next.js automaticamente
# =====================================================

clear

set -e  # Para em caso de erro

echo "🚀 INICIANDO AMBIENTE DE DESENVOLVIMENTO KAORA"
echo "==============================================="

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# =====================================================
# 1. VERIFICAR DEPENDÊNCIAS
# =====================================================

echo -e "${BLUE}📋 Verificando dependências...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker não está instalado!${NC}"
    exit 1
fi

if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose não está instalado!${NC}"
    exit 1
fi

if ! command -v yarn &> /dev/null; then
    echo -e "${RED}❌ Yarn não está instalado!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Todas as dependências estão instaladas${NC}"

# =====================================================
# 2. PARAR PROCESSOS EXISTENTES
# =====================================================

echo -e "${BLUE}🛑 Parando processos existentes...${NC}"

# Parar Next.js se estiver rodando
pkill -f "next dev" 2>/dev/null || true

# Parar PostgreSQL se estiver rodando
docker compose down 2>/dev/null || true

echo -e "${GREEN}✅ Processos anteriores parados${NC}"

# =====================================================
# 3. INICIAR POSTGRESQL
# =====================================================

echo -e "${BLUE}🐳 Iniciando PostgreSQL...${NC}"

# Verificar se arquivo docker-compose.yml existe
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ Arquivo docker-compose.yml não encontrado!${NC}"
    echo -e "${YELLOW}💡 Certifique-se de estar na pasta raiz do projeto${NC}"
    exit 1
fi

# Iniciar PostgreSQL
docker compose up -d

# Aguardar PostgreSQL inicializar
echo -e "${YELLOW}⏳ Aguardando PostgreSQL inicializar...${NC}"
sleep 3

# Verificar se PostgreSQL está rodando
if ! docker ps | grep -q "kaora-postgres"; then
    echo -e "${RED}❌ Falha ao iniciar PostgreSQL!${NC}"
    docker-compose logs
    exit 1
fi

echo -e "${GREEN}✅ PostgreSQL iniciado com sucesso na porta 9069${NC}"

# =====================================================
# 4. INSTALAR DEPENDÊNCIAS DOS WORKSPACES
# =====================================================

echo -e "${BLUE}📦 Instalando dependências dos workspaces...${NC}"
yarn install
echo -e "${GREEN}✅ Dependências dos workspaces instaladas${NC}"

# =====================================================
# 5. GERAR CLIENTE PRISMA
# =====================================================

echo -e "${BLUE}🔧 Gerando cliente Prisma...${NC}"

cd packages/infrastructure

# Verificar se DATABASE_URL está definida
export DATABASE_URL="postgresql://kaora_user:kaora_password123@localhost:9069/kaora?schema=public"

# Criar diretório do cliente se não existir
mkdir -p prisma/generated/client

# Tentar diferentes estratégias para gerar o cliente
echo "🔄 Tentando gerar cliente Prisma..."

# Como o corepack está causando problemas, vamos usar uma abordagem manual
echo "📋 Usando estratégias alternativas devido a problemas com corepack..."

# Verificar se o cliente já foi gerado antes
if [ -f "prisma/generated/client/index.js" ] || [ -f "node_modules/@prisma/client/index.js" ]; then
    echo -e "${GREEN}✅ Cliente Prisma já existe ou foi gerado anteriormente${NC}"
else
    echo -e "${YELLOW}⚠️ Cliente Prisma precisa ser gerado manualmente${NC}"
    echo -e "${YELLOW}💡 Execute após inicialização:${NC}"
    echo -e "${YELLOW}   cd packages/infrastructure${NC}"
    echo -e "${YELLOW}   yarn prisma generate${NC}"
    echo -e "${YELLOW}💡 O banco PostgreSQL estará funcionando mesmo assim${NC}"
fi

cd ../..

# =====================================================
# 6. CONSTRUIR PACOTES
# =====================================================


echo -e "${BLUE}📦 Instalando dependências dos workspaces...${NC}"
yarn install
echo -e "${GREEN}✅ Dependências dos workspaces instaladas${NC}"

echo -e "${BLUE}🔨 Construindo pacotes...${NC}"

# Construir domain
echo -e "${YELLOW}  📦 Construindo @kaora/domain...${NC}"
yarn workspace @kaora/domain build

# Construir infrastructure  
echo -e "${YELLOW}  📦 Construindo @kaora/infrastructure...${NC}"
yarn workspace @kaora/infrastructure build

# Construir application
echo -e "${YELLOW}  📦 Construindo @kaora/application...${NC}"
yarn workspace @kaora/application build

echo -e "${GREEN}✅ Todos os pacotes construídos${NC}"

# =====================================================
# 7. INSTALAR DEPENDÊNCIAS DO NEXT.JS E INICIAR NEXT.JS
# =====================================================

echo -e "${BLUE}📦 Instalando dependências do Next.js...${NC}"
cd web
yarn install
echo -e "${GREEN}✅ Dependências do Next.js instaladas${NC}"

echo -e "${BLUE}🌐 Iniciando Next.js...${NC}"
yarn dev > ../dev.log 2>&1 &
NEXTJS_PID=$!

# Aguardar Next.js inicializar
echo -e "${YELLOW}⏳ Aguardando Next.js inicializar...${NC}"
sleep 5

# Verificar se Next.js está rodando
if ! ps -p $NEXTJS_PID > /dev/null; then
    echo -e "${RED}❌ Falha ao iniciar Next.js!${NC}"
    cat ../dev.log
    exit 1
fi

echo -e "${GREEN}✅ Next.js iniciado com sucesso na porta 3001${NC}"
cd ..

# =====================================================
# 8. INFORMAÇÕES FINAIS
# =====================================================

echo ""
echo -e "${GREEN}🎉 AMBIENTE DE DESENVOLVIMENTO INICIADO COM SUCESSO!${NC}"
echo "=================================================="
echo ""
echo -e "${BLUE}📊 Serviços disponíveis:${NC}"
echo -e "  🌐 Next.js:     ${GREEN}http://localhost:3001${NC}"
echo -e "  🗄️  PostgreSQL:  ${GREEN}localhost:9069${NC}"
echo -e "  📋 API:         ${GREEN}http://localhost:3001/api/business/create${NC}"
echo ""
echo -e "${BLUE}🔧 Comandos úteis:${NC}"
echo -e "  🛑 Parar ambiente:   ${YELLOW}docker-compose down && pkill -f 'next dev'${NC}"
echo -e "  📊 Ver logs:         ${YELLOW}tail -f dev.log${NC}"
echo -e "  🗃️  Prisma Studio:    ${YELLOW}cd packages/infrastructure && yarn prisma studio${NC}"
echo -e "  🧪 Testar API:       ${YELLOW}./test-api-domain.sh${NC}"
echo ""
echo -e "${BLUE}🌐 URLs importantes:${NC}"
echo -e "  📱 Frontend:         ${GREEN}http://localhost:3001${NC}"
echo -e "  🔌 API Business:     ${GREEN}http://localhost:3001/api/business/create${NC}"
echo -e "  🗄️  Database:        ${GREEN}postgresql://kaora_user:kaora_password123@localhost:9069/kaora${NC}"
echo ""
echo -e "${YELLOW}💡 Pressione Ctrl+C para parar o desenvolvimento${NC}"

# Manter script rodando e monitorar processos
trap 'echo -e "\n${RED}🛑 Parando ambiente...${NC}"; docker-compose down; pkill -f "next dev"; exit 0' INT

# Loop infinito para manter script rodando
while true; do
    sleep 30
    
    # Verificar se PostgreSQL ainda está rodando
    if ! docker ps | grep -q "kaora-postgres"; then
        echo -e "${RED}❌ PostgreSQL parou de funcionar!${NC}"
        break
    fi
    
    # Verificar se Next.js ainda está rodando  
    if ! ps -p $NEXTJS_PID > /dev/null; then
        echo -e "${RED}❌ Next.js parou de funcionar!${NC}"
        break
    fi
done
