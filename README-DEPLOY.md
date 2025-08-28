# 🚀 Guia de Deploy - Banco de Dados Kaora

## 📋 Scripts SQL para Produção

Este repositório contém os scripts SQL necessários para deploy do sistema Kaora em ambiente de produção.

## 📁 Arquivos

- **`production-deploy.sql`** - Script principal para criação das tabelas em produção
- **`monitoring-queries.sql`** - Consultas para monitoramento e manutenção

## 🛠️ Como Executar

### 1. Preparação do Ambiente

```bash
# Conectar ao banco PostgreSQL
psql -h localhost -U seu_usuario -d kaora_prod
```

### 2. Executar Script Principal

```bash
# Executar o script de deploy
psql -h localhost -U seu_usuario -d kaora_prod -f production-deploy.sql
```

### 3. Verificar Instalação

```bash
# Conectar ao banco e verificar tabelas
psql -h localhost -U seu_usuario -d kaora_prod

# Listar tabelas criadas
\d

# Verificar se as extensões foram instaladas
\dx
```

## 📊 Estrutura Criada

### Tabelas Principais

1. **`business`** - Empresas/tenants do sistema
2. **`users`** - Usuários multitenant
3. **`audit_logs`** - Logs de auditoria completos

### Índices de Performance

- Índices em campos únicos (email, document)
- Índices compostos para consultas de auditoria
- Índices GIN para busca por similaridade
- Índices parciais para limpeza automática

### Segurança

- Row Level Security (RLS) habilitado
- Políticas de isolamento por empresa
- Triggers para auditoria automática

## 🔍 Monitoramento

### Consultas de Health Check

```sql
-- Verificar tamanho das tabelas
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('business', 'users', 'audit_logs');
```

### Estatísticas de Uso

```sql
-- Atividades por empresa (últimos 7 dias)
SELECT
    b.name as empresa,
    COUNT(al.id) as total_logs,
    COUNT(DISTINCT al.user_id) as usuarios_ativos
FROM audit_logs al
JOIN business b ON al.business_id = b.id
WHERE al.timestamp >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY b.id, b.name
ORDER BY total_logs DESC;
```

## 🧹 Manutenção

### Limpeza de Logs Antigos

```sql
-- Manter apenas últimos 90 dias
DELETE FROM audit_logs
WHERE timestamp < CURRENT_DATE - INTERVAL '90 days';
```

### Reindexação

```sql
-- Executar durante janela de manutenção
ANALYZE business;
ANALYZE users;
ANALYZE audit_logs;
REINDEX TABLE CONCURRENTLY audit_logs;
```

## 🔐 Segurança

### Configurações Recomendadas

1. **Usuários dedicados**: Crie usuários específicos para aplicação
2. **SSL**: Habilite conexões SSL
3. **Backup**: Configure backups automáticos
4. **Monitoramento**: Configure alertas para espaço em disco

### Exemplo de Configuração

```sql
-- Criar usuário da aplicação
CREATE USER kaora_app WITH PASSWORD 'sua_senha_forte';
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO kaora_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO kaora_app;
```

## 📈 Performance

### Otimizações Incluídas

- **Fillfactor**: 80% para tabelas com updates frequentes
- **Autovacuum**: Configurado para tabelas de auditoria
- **Índices**: Otimizados para padrões de consulta comuns

### Monitoramento de Performance

```sql
-- Queries mais lentas
SELECT
    query,
    calls,
    total_time / 1000 as total_time_seconds,
    mean_time / 1000 as mean_time_ms
FROM pg_stat_statements
WHERE query LIKE '%audit_logs%'
ORDER BY total_time DESC
LIMIT 10;
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Erro de permissão**: Verifique privilégios do usuário
2. **Extensões não encontradas**: Instale `postgresql-contrib`
3. **Espaço em disco**: Monitore crescimento da tabela `audit_logs`

### Recuperação de Emergência

```sql
-- Parar todas as conexões ativas
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'kaora_prod' AND pid <> pg_backend_pid();

-- Restaurar backup
psql -h localhost -U seu_usuario -d kaora_prod -f backup_file.sql
```

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs da aplicação
2. Execute as consultas de monitoramento
3. Verifique a documentação completa no repositório

## ✅ Checklist de Deploy

- [ ] Banco PostgreSQL instalado e configurado
- [ ] Usuário com permissões adequadas criado
- [ ] Script `production-deploy.sql` executado com sucesso
- [ ] Tabelas e índices criados corretamente
- [ ] Aplicação consegue conectar ao banco
- [ ] Primeiro usuário administrador criado
- [ ] Backup inicial realizado
- [ ] Monitoramento configurado

---

**Versão**: 1.0.0
**Data**: 28 de Agosto de 2025
**Sistema**: Kaora - Sistema de Locação com Auditoria
