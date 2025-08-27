#!/bin/bash

# ==========================================
# SCRIPT DE BACKUP - KAORA PRODUÇÃO
# ==========================================

clear

set -e

# Carregar variáveis de ambiente
if [[ -f .env ]]; then
    source .env
else
    echo "Arquivo .env não encontrado!"
    exit 1
fi

# Configurações
BACKUP_DIR="/backups/kaora"
DATE=$(date +%Y%m%d_%H%M%S)
COMPOSE_FILE="docker-compose.prod.yml"

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

# Criar diretório de backup se não existir
mkdir -p "$BACKUP_DIR"

log_info "🗄️ Iniciando backup do Kaora - $DATE"

# Verificar se DATABASE_URL está configurada
if [[ -z "$DATABASE_URL" ]]; then
    log_error "❌ DATABASE_URL não está configurada no arquivo .env"
    log_info "Configure a variável DATABASE_URL para o cluster PostgreSQL externo"
    exit 1
fi

# Extrair dados da CONNECTION STRING para backup
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')

# Backup do PostgreSQL externo
log_info "Fazendo backup do PostgreSQL externo..."
PGPASSWORD="$DB_PASS" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_DIR/postgres_backup_$DATE.sql"

if [[ $? -eq 0 ]]; then
    log_info "✅ Backup do PostgreSQL concluído: postgres_backup_$DATE.sql"
else
    log_error "❌ Falha no backup do PostgreSQL externo"
    log_error "Verifique se pg_dump está instalado e se a conexão com o banco está funcionando"
    exit 1
fi

# Backup do Redis (opcional)
log_info "Fazendo backup do Redis..."
docker compose -f "$COMPOSE_FILE" exec -T redis redis-cli --rdb - > "$BACKUP_DIR/redis_backup_$DATE.rdb"

if [[ $? -eq 0 ]]; then
    log_info "✅ Backup do Redis concluído: redis_backup_$DATE.rdb"
else
    log_warn "⚠️ Falha no backup do Redis (não crítico)"
fi

# Backup das configurações
log_info "Fazendo backup das configurações..."
cp .env "$BACKUP_DIR/env_backup_$DATE"
cp "$COMPOSE_FILE" "$BACKUP_DIR/docker-compose_backup_$DATE.yml"

# Compactar backups
log_info "Compactando backups..."
cd "$BACKUP_DIR"
tar -czf "kaora_full_backup_$DATE.tar.gz" *_backup_$DATE* postgres_backup_$DATE.sql redis_backup_$DATE.rdb

# Remover arquivos temporários
rm -f *_backup_$DATE env_backup_$DATE docker-compose_backup_$DATE.yml postgres_backup_$DATE.sql redis_backup_$DATE.rdb

log_info "✅ Backup completo criado: kaora_full_backup_$DATE.tar.gz"

# Limpar backups antigos (manter apenas os últimos 7 dias)
log_info "Limpando backups antigos..."
find "$BACKUP_DIR" -name "kaora_full_backup_*.tar.gz" -mtime +7 -delete

log_info "🎉 Backup concluído com sucesso!"

# Mostrar tamanho do backup
BACKUP_SIZE=$(du -h "$BACKUP_DIR/kaora_full_backup_$DATE.tar.gz" | cut -f1)
log_info "📦 Tamanho do backup: $BACKUP_SIZE"

# Listar backups disponíveis
echo ""
log_info "📋 Backups disponíveis:"
ls -lh "$BACKUP_DIR"/kaora_full_backup_*.tar.gz
