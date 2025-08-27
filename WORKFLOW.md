# 🔄 Fluxo de Trabalho Prático - Kaora

## 📋 Cenários de Uso dos Scripts

### 🚀 **1. SETUP INICIAL (Primeira vez)**

```bash
# 1. Configurar ambiente
cp .env.production .env
nano .env  # Configurar DATABASE_URL, NEXTAUTH_SECRET, etc.

# 2. Testar conexão com banco externo
./test-db-connection.sh

# 3. Deploy inicial completo
./deploy.sh initial
```

**Quando usar**: Primeira instalação em um servidor novo.

---

### 🔄 **2. DESENVOLVIMENTO LOCAL**

```bash
# Ambiente de desenvolvimento (com PostgreSQL local)
./dev.sh
```

**Quando usar**: Desenvolvimento local com banco PostgreSQL em container.

---

### 📦 **3. ATUALIZAÇÕES DE CÓDIGO (Mais comum)**

#### 🔧 **Cenário A: Mudanças na aplicação**
```bash
# Fazer mudanças no código
git add .
git commit -m "feat: nova funcionalidade"
git push origin main

# Deploy apenas da aplicação (zero downtime)
./deploy.sh rebuild kaora-app
```

#### 📊 **Cenário B: Mudanças no Redis**
```bash
# Deploy apenas do Redis (raramente necessário)
./deploy.sh rebuild redis
```

#### 🏗️ **Cenário C: Mudanças na infraestrutura**
```bash
# Mudanças no docker-compose.prod.yml, Dockerfile, etc.
./deploy.sh initial  # Deploy completo
```

**Quando usar**: 90% das atualizações serão `./deploy.sh rebuild kaora-app`

---

### 🤖 **4. DEPLOY AUTOMÁTICO (CI/CD)**

#### 📡 **Via Webhook GitHub**
```bash
# Configurar webhook no GitHub apontando para:
# https://seu-servidor.com/webhook

# O script roda automaticamente:
./webhook-deploy.sh
```

#### 🔧 **Via Pipeline CI/CD**
```yaml
# .github/workflows/deploy.yml
- name: Deploy to Production
  run: |
    ssh user@servidor "cd /path/to/kaora && ./deploy.sh rebuild kaora-app"
```

**Quando usar**: Para automação completa de deploys.

---

### 🛠️ **5. MANUTENÇÃO E DEBUG**

#### 📊 **Monitoramento diário**
```bash
# Ver status dos serviços
docker compose -f docker-compose.prod.yml ps

# Ver logs em tempo real
docker compose -f docker-compose.prod.yml logs -f kaora-app
```

#### 🗄️ **Backup (semanal/mensal)**
```bash
# Backup automático
./backup.sh

# Configurar cron para backup automático:
# 0 2 * * 0 cd /path/to/kaora && ./backup.sh
```

#### 🔍 **Quando algo der errado**
```bash
# 1. Verificar logs
docker compose -f docker-compose.prod.yml logs kaora-app

# 2. Testar health check
curl http://localhost:3000/api/health

# 3. Testar conexão com banco
./test-db-connection.sh

# 4. Restart se necessário
./deploy.sh rebuild kaora-app
```

---

### 🔧 **6. OTIMIZAÇÃO DE DOCKER**

#### 📦 **Análise de performance**
```bash
# Analisar tamanho da imagem
./analyze-docker.sh

# Comparar diferentes Dockerfiles
./build-optimize.sh

# Limpar recursos não utilizados
docker system prune -f
```

**Quando usar**: Mensalmente ou quando performance estiver lenta.

---

## 📅 **Cronograma Típico de Uso**

### **🔄 Diário**
- `docker compose logs -f kaora-app` (monitoramento)
- `./deploy.sh rebuild kaora-app` (atualizações de código)

### **📊 Semanal**
- `./backup.sh` (backup dos dados)
- `docker system df` (verificar uso de disco)

### **🛠️ Mensal**
- `./analyze-docker.sh` (otimização)
- `docker system prune -f` (limpeza)
- Atualizar dependências e rebuild completo

### **🎯 Conforme necessário**
- `./test-db-connection.sh` (problemas de conectividade)
- `./deploy.sh initial` (mudanças na infraestrutura)

---

## 🚨 **Cenários de Emergência**

### **🔥 Aplicação não responde**
```bash
# 1. Verificar status
docker compose -f docker-compose.prod.yml ps

# 2. Ver logs de erro
docker compose -f docker-compose.prod.yml logs --tail=50 kaora-app

# 3. Restart rápido
./deploy.sh rebuild kaora-app

# 4. Se não resolver, restart completo
./deploy.sh initial
```

### **💾 Problemas de banco**
```bash
# 1. Testar conexão
./test-db-connection.sh

# 2. Ver logs
docker compose -f docker-compose.prod.yml logs redis

# 3. Restart Redis se necessário
./deploy.sh rebuild redis
```

### **🗄️ Recuperação de backup**
```bash
# 1. Parar aplicação
docker compose -f docker-compose.prod.yml down

# 2. Restaurar banco (exemplo)
psql -h cluster.com -U user -d kaora < backup_20240827_120000.sql

# 3. Restart aplicação
./deploy.sh initial
```

---

## 📋 **Checklists Rápidos**

### ✅ **Deploy de Nova Feature**
1. [ ] Código testado localmente
2. [ ] `git push origin main`
3. [ ] `./deploy.sh rebuild kaora-app`
4. [ ] Verificar logs: `docker compose logs -f kaora-app`
5. [ ] Testar funcionalidade no navegador

### ✅ **Setup Novo Servidor**
1. [ ] Instalar Docker + Docker Compose
2. [ ] Clonar repositório
3. [ ] Configurar `.env`
4. [ ] `./test-db-connection.sh`
5. [ ] `./deploy.sh initial`
6. [ ] Configurar nginx/proxy
7. [ ] Configurar backup automático

### ✅ **Manutenção Mensal**
1. [ ] `./backup.sh`
2. [ ] `./analyze-docker.sh`
3. [ ] `docker system prune -f`
4. [ ] Verificar logs de erro
5. [ ] Atualizar dependências se necessário

---

## 🎯 **Resumo: Qual Script Usar Quando?**

| Situação | Script | Frequência |
|----------|--------|------------|
| **Código novo** | `./deploy.sh rebuild kaora-app` | Diário |
| **Primeira instalação** | `./deploy.sh initial` | Uma vez |
| **Problema de conectividade** | `./test-db-connection.sh` | Conforme necessário |
| **Backup** | `./backup.sh` | Semanal |
| **Performance lenta** | `./analyze-docker.sh` | Mensal |
| **Deploy automático** | `./webhook-deploy.sh` | Automático |
| **Desenvolvimento** | `./dev.sh` | Local apenas |

**🔑 Regra de ouro**: `./deploy.sh rebuild kaora-app` resolve 90% dos casos!
