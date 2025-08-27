#!/bin/bash

clear

echo "🗄️ Setting up Prisma Database..."
echo "=================================="

# Usar os scripts definidos no package.json via yarn workspace
echo "🔄 Generating Prisma client..."
yarn workspace @kaora/infrastructure run prisma:generate
if [ $? -ne 0 ]; then
    echo "❌ Prisma generate failed!"
    exit 1
fi

echo "✅ Prisma client generated successfully!"

# Verificar se DATABASE_URL está configurada antes de fazer push
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️ DATABASE_URL not configured. Skipping database push."
    echo "💡 Configure DATABASE_URL in .env to enable database operations."
else
    echo "📊 Pushing schema to database..."
    yarn workspace @kaora/infrastructure run prisma:push
    if [ $? -ne 0 ]; then
        echo "❌ Prisma push failed!"
        exit 1
    fi
    echo "✅ Database schema updated successfully!"
fi

echo "✅ Prisma setup completed successfully!"

# Opção para abrir Prisma Studio
read -p "🎨 Do you want to open Prisma Studio? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Opening Prisma Studio..."
    yarn workspace @kaora/infrastructure run prisma:studio &
    echo "📝 Prisma Studio is available at http://localhost:5555"
fi

echo ""
echo "🎯 Available Prisma commands:"
echo "  yarn workspace @kaora/infrastructure run prisma:generate"
echo "  yarn workspace @kaora/infrastructure run prisma:push"
echo "  yarn workspace @kaora/infrastructure run prisma:studio"
echo ""
