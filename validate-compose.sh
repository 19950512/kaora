#!/bin/bash

# ==========================================
# VALIDAÇÃO DE SINTAXE DOCKER COMPOSE
# ==========================================

echo "🔍 Validando sintaxe do Docker Compose..."

# Verificar se docker compose está disponível
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não encontrado"
    exit 1
fi

if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose V2 não encontrado"
    echo "💡 Instale o Docker Compose V2 ou use 'docker-compose' se estiver usando V1"
    exit 1
fi

echo "✅ Docker Compose V2 detectado"

# Validar docker-compose.yml (desenvolvimento)
if [ -f "docker-compose.yml" ]; then
    echo "🔍 Validando docker-compose.yml..."
    if docker compose -f docker-compose.yml config > /dev/null; then
        echo "✅ docker-compose.yml válido"
    else
        echo "❌ docker-compose.yml inválido"
    fi
fi

# Validar docker-compose.prod.yml (produção)
if [ -f "docker-compose.prod.yml" ]; then
    echo "🔍 Validando docker-compose.prod.yml..."
    if docker compose -f docker-compose.prod.yml config > /dev/null; then
        echo "✅ docker-compose.prod.yml válido"
    else
        echo "❌ docker-compose.prod.yml inválido"
    fi
fi

echo "🎉 Validação concluída!"
