# Etapa 1: Instala dependências completas e faz build
FROM node:20-alpine AS builder
WORKDIR /app

# Instala dependências necessárias no Alpine
RUN apk add --no-cache libc6-compat

# Ativa Corepack para gerenciar Yarn
RUN corepack enable

# Força o uso do Yarn 4.x (caso não tenha sido feito corretamente)
RUN corepack prepare yarn@4.9.3 --activate

# Copia arquivos do Yarn e dependências do workspace
COPY package.json yarn.lock* .yarnrc.yml ./
COPY .yarn ./.yarn
COPY packages/domain/package.json ./packages/domain/
COPY packages/application/package.json ./packages/application/
COPY packages/infrastructure/package.json ./packages/infrastructure/
COPY web/package.json ./web/

# Instala todas dependências do workspace
RUN yarn install --immutable

# Copia o código fonte completo
COPY . .

# Gera cliente Prisma antes dos builds
RUN rm -rf packages/infrastructure/prisma/generated || true
ENV PRISMA_GENERATE_SKIP_AUTOINSTALL=true
RUN yarn workspace @kaora/infrastructure run prisma:generate

# Build dos packages internos
RUN yarn workspace @kaora/domain run build
RUN yarn workspace @kaora/infrastructure run build
RUN yarn workspace @kaora/application run build

# Build da aplicação Next.js
RUN yarn workspace web run build

# Remove cache do Next.js para diminuir tamanho
RUN rm -rf web/.next/cache

# Etapa 2: Instala apenas dependências de produção
FROM node:20-alpine AS deps
WORKDIR /app

# Ativa Corepack para Yarn
RUN corepack enable

# Força o uso do Yarn 4.x (caso não tenha sido feito corretamente)
RUN corepack prepare yarn@4.9.3 --activate

# Copia arquivos necessários para dependências
COPY package.json yarn.lock* .yarnrc.yml ./
COPY .yarn ./.yarn

# Instala apenas dependências de produção usando o foco no workspace
RUN yarn workspaces focus --production

# Etapa 3: Runner final para produção
FROM node:20-alpine AS runner

RUN apk add --no-cache libc6-compat curl

# Ativa Corepack para Yarn no runner
RUN corepack enable
RUN corepack prepare yarn@4.9.3 --activate

# Cria usuário não-root
RUN addgroup -g 1001 -S nodejs \
  && adduser -S nextjs -u 1001 -G nodejs

WORKDIR /app

# Copia node_modules de produção
COPY --from=deps /app/node_modules ./node_modules

# Copia arquivos do Yarn workspace
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.yarnrc.yml ./.yarnrc.yml
COPY --from=builder /app/.yarn ./.yarn

# Copia build dos packages internos
COPY --from=builder /app/packages/domain/dist ./packages/domain/dist
COPY --from=builder /app/packages/domain/package.json ./packages/domain/
COPY --from=builder /app/packages/application/dist ./packages/application/dist
COPY --from=builder /app/packages/application/package.json ./packages/application/
COPY --from=builder /app/packages/infrastructure/dist ./packages/infrastructure/dist
COPY --from=builder /app/packages/infrastructure/package.json ./packages/infrastructure/
COPY --from=builder /app/packages/infrastructure/prisma ./packages/infrastructure/prisma

# Copia build da aplicação Next.js e arquivos públicos
COPY --from=builder /app/web/.next/standalone ./
COPY --from=builder /app/web/.next/static ./web/.next/static
COPY --from=builder /app/web/public ./web/public

# Remove dependências dev para deixar a imagem enxuta
RUN rm -rf node_modules/@types \
  && rm -rf node_modules/typescript \
  && rm -rf node_modules/eslint \
  && rm -rf node_modules/@eslint \
  && rm -rf node_modules/@typescript-eslint \
  && rm -rf node_modules/prettier \
  && find node_modules -name "*.d.ts" -delete \
  && find node_modules -name "*.map" -delete \
  && find node_modules -name "LICENSE*" -delete \
  && find node_modules -name "README.md" -delete

# Define variáveis de ambiente
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=9990
ENV HOSTNAME=0.0.0.0
ENV NODE_TLS_REJECT_UNAUTHORIZED=0

# Muda para usuário não-root
USER nextjs

# Expõe a porta da aplicação
EXPOSE 9990

# Altere o comando para usar o Next.js standalone
CMD ["node", "web/server.js"]
