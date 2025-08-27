#!/bin/bash

clear

echo "🏗️ Building Kaora Clean Architecture..."
echo "==========================================="

# Build na ordem correta (domain -> infrastructure -> application)
echo "📦 Building @kaora/domain..."
yarn workspace @kaora/domain build
if [ $? -ne 0 ]; then
    echo "❌ Domain build failed!"
    exit 1
fi

echo "🗄️ Generating Prisma client..."
yarn workspace @kaora/infrastructure run prisma:generate
if [ $? -ne 0 ]; then
    echo "❌ Prisma client generation failed!"
    exit 1
fi

echo "🏗️ Building @kaora/infrastructure..."
yarn workspace @kaora/infrastructure build
if [ $? -ne 0 ]; then
    echo "❌ Infrastructure build failed!"
    exit 1
fi

echo "🎯 Building @kaora/application..."
yarn workspace @kaora/application build
if [ $? -ne 0 ]; then
    echo "❌ Application build failed!"
    exit 1
fi

echo "✅ All packages built successfully!"

# Restart Next.js se estiver rodando
echo "🔄 Restarting Next.js..."
pkill -f "next dev" 2>/dev/null || echo "Next.js not running"

echo "🚀 Starting Next.js..."
cd web && yarn dev &

# Aguardar o Next.js inicializar
echo "⏳ Waiting for Next.js to start..."
sleep 3

# Verificar se está rodando
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Next.js is running at http://localhost:3000"
else
    echo "⚠️ Next.js may not be fully ready yet"
fi

echo ""
echo "🎉 Clean Architecture rebuild complete!"
echo "💡 All layers are now available: Domain → Infrastructure → Application → Web"
echo ""
echo "🧪 Test the new clean API:"
echo "curl -X POST http://localhost:3000/api/business/create \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"businessName\": \"Clean Arch Test\", \"responsibleName\": \"João Silva\", \"responsibleEmail\": \"joao@test.com\", \"responsiblePassword\": \"senha123\", \"responsibleDocument\": \"84167670097\"}'"
