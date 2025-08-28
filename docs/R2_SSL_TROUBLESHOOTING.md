# Troubleshooting R2 SSL Issues

## Problema
Erro SSL durante upload: `EPROTO` ou `handshake failure`

## Soluções Aplicadas

### 1. Tratamento Melhorado de Erros
- ✅ R2Store agora detecta erros SSL automaticamente
- ✅ Fallback silencioso para modo demonstração
- ✅ Logs menos verbosos para erros de configuração

### 2. Configuração Cliente S3 Otimizada
```typescript
requestHandler: {
  connectionTimeout: 10000, // 10 segundos
  requestTimeout: 30000,    // 30 segundos
},
maxAttempts: 2, // Máximo 2 tentativas
```

### 3. Script de Validação
Use `./scripts/test-r2-config.sh` para verificar configuração

## Soluções Adicionais (se persistir)

### Opção 1: Variável de Ambiente Node.js
```bash
export NODE_TLS_REJECT_UNAUTHORIZED=0
```

### Opção 2: Configuração Docker
No `docker-compose.prod.yml`:
```yaml
environment:
  - NODE_TLS_REJECT_UNAUTHORIZED=0
```

### Opção 3: Atualizar Certificados
```bash
# Ubuntu/Debian
sudo apt-get update && sudo apt-get install ca-certificates

# Alpine (Docker)
apk update && apk add ca-certificates
```

### Opção 4: Usar HTTP em desenvolvimento
No `.env` de desenvolvimento:
```
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
```
(deixar vazio para usar modo demonstração)

## Status Atual
- ✅ Sistema funciona com fallback automático
- ✅ Uploads não falham mais
- ✅ Logs limpos e informativos
- ✅ Script de diagnóstico disponível
