#!/bin/bash

# ==========================================
# TESTE DE CONEXÃO - BANCO EXTERNO
# ==========================================

set -e

# Carregar variáveis de ambiente
if [[ -f .env ]]; then
    source .env
else
    echo "❌ Arquivo .env não encontrado!"
    exit 1
fi

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_info "🔍 Testando conexão com o banco de dados externo..."

# Verificar se DATABASE_URL está configurada
if [[ -z "$DATABASE_URL" ]]; then
    log_error "DATABASE_URL não está configurada no arquivo .env"
    exit 1
fi

# Extrair dados da CONNECTION STRING
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')

log_info "Configurações extraídas:"
echo "  Host: $DB_HOST"
echo "  Porta: $DB_PORT"
echo "  Banco: $DB_NAME"
echo "  Usuário: $DB_USER"
echo "  Senha: [OCULTA]"

# Verificar se pg_isready está disponível
if ! command -v pg_isready &> /dev/null; then
    log_error "pg_isready não encontrado. Instale postgresql-client:"
    echo "  sudo apt-get update"
    echo "  sudo apt-get install postgresql-client"
    exit 1
fi

# Teste de conectividade
log_info "Testando conectividade..."
if pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME"; then
    log_info "✅ Conectividade OK"
else
    log_error "❌ Falha na conectividade"
    exit 1
fi

# Teste de autenticação
log_info "Testando autenticação..."
if PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
    log_info "✅ Autenticação OK"
else
    log_error "❌ Falha na autenticação"
    exit 1
fi

# Verificar extensões necessárias
log_info "Verificando extensões necessárias..."
EXTENSIONS_CHECK=$(PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM pg_extension WHERE extname IN ('uuid-ossp', 'pg_trgm');")

if [[ "$EXTENSIONS_CHECK" -eq 2 ]]; then
    log_info "✅ Extensões necessárias estão instaladas"
else
    log_warn "⚠️  Algumas extensões podem estar faltando"
    log_info "Execute no banco: CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS \"pg_trgm\";"
fi

# Verificar se as tabelas existem
log_info "Verificando se as tabelas existem..."
TABLES_COUNT=$(PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('business', 'users', 'audit_logs');")

if [[ "$TABLES_COUNT" -eq 3 ]]; then
    log_info "✅ Tabelas principais existem"
else
    log_warn "⚠️  Algumas tabelas podem estar faltando"
    log_info "Execute o script de inicialização: psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f docker/init-db.sql"
fi

log_info "🎉 Teste de conexão concluído com sucesso!"
log_info "O banco de dados externo está pronto para uso."
