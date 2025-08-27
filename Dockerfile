# ==========================================
# DOCKERFILE OTIMIZADO PARA PRODUÇÃO - KAORA
# ==========================================

# Etapa 1: Instala dependências e faz build
FROM node:20-alpine AS builder
WORKDIR /app

# Instala dependências necessárias para o Alpine
RUN apk add --no-cache libc6-compat

# Instala o yarn globalmente
RUN corepack enable && corepack prepare yarn@4.9.3 --activate

# Copia apenas os arquivos de dependências do workspace
COPY package.json yarn.lock* .yarnrc.yml ./
COPY .yarn ./.yarn
COPY packages/domain/package.json ./packages/domain/
COPY packages/application/package.json ./packages/application/
COPY packages/infrastructure/package.json ./packages/infrastructure/
COPY web/package.json ./web/

# Instala todas as dependências
RUN yarn install --immutable

# Copia todo o código do projeto
COPY . .

# Gera o cliente Prisma ANTES dos builds
RUN yarn workspace @kaora/infrastructure run prisma:generate

# Build dos packages internos
RUN yarn workspace @kaora/domain run build
RUN yarn workspace @kaora/infrastructure run build
RUN yarn workspace @kaora/application run build

# Build da aplicação Next.js
RUN yarn workspace web run build

# Remove cache do Next.js para reduzir imagem final
RUN rm -rf web/.next/cache

# Etapa 2: Runner final para produção
FROM node:20-alpine AS runner

# Instala dependências necessárias para o Alpine
RUN apk add --no-cache libc6-compat curl

# Criação de usuário seguro
RUN addgroup -g 1001 -S nodejs \
  && adduser -S nextjs -u 1001 -G nodejs

WORKDIR /app

# Copia apenas os node_modules necessários do builder
COPY --from=builder /app/node_modules ./node_modules

# Copia builds dos packages internos
COPY --from=builder /app/packages/domain/dist ./packages/domain/dist
COPY --from=builder /app/packages/domain/package.json ./packages/domain/
COPY --from=builder /app/packages/application/dist ./packages/application/dist
COPY --from=builder /app/packages/application/package.json ./packages/application/
COPY --from=builder /app/packages/infrastructure/dist ./packages/infrastructure/dist
COPY --from=builder /app/packages/infrastructure/package.json ./packages/infrastructure/
COPY --from=builder /app/packages/infrastructure/prisma ./packages/infrastructure/prisma

# Copia arquivos essenciais do build Next.js
COPY --from=builder /app/web/.next/standalone ./
COPY --from=builder /app/web/.next/static ./web/.next/static
COPY --from=builder /app/web/public ./web/public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.yarnrc.yml ./.yarnrc.yml

# Remove dependências de desenvolvimento desnecessárias
RUN rm -rf node_modules/@types \
  && rm -rf node_modules/typescript \
  && rm -rf node_modules/eslint* \
  && rm -rf node_modules/@typescript-eslint \
  && rm -rf node_modules/prettier \
  && rm -rf node_modules/@next/env \
  && find node_modules -name "*.d.ts" -delete \
  && find node_modules -name "*.map" -delete \
  && find node_modules -name "LICENSE*" -delete \
  && find node_modules -name "*.md" -delete

# Define variáveis de ambiente para produção
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=9990

# Muda para o usuário não-root
USER nextjs

# Expõe a porta da aplicação
EXPOSE 9990

# Comando para iniciar a aplicação
CMD ["node", "web/server.js"]
