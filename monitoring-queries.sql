-- =====================================================
-- CONSULTAS DE MONITORAMENTO E MANUTENÇÃO
-- Sistema Kaora - Auditoria em Produção
-- =====================================================

-- =====================================================
-- 1. ESTATÍSTICAS GERAIS DO SISTEMA
-- =====================================================

-- Total de empresas ativas
SELECT
    COUNT(*) as total_empresas_ativas,
    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as novas_ultimos_30_dias
FROM business
WHERE active = true;

-- Total de usuários por empresa
SELECT
    b.name as empresa,
    b.email as email_empresa,
    COUNT(u.id) as total_usuarios,
    COUNT(CASE WHEN u.active = true THEN 1 END) as usuarios_ativos
FROM business b
LEFT JOIN users u ON b.id = u.business_id
GROUP BY b.id, b.name, b.email
ORDER BY total_usuarios DESC;

-- =====================================================
-- 2. ESTATÍSTICAS DE AUDITORIA
-- =====================================================

-- Atividades de auditoria por contexto (últimos 30 dias)
SELECT
    context,
    COUNT(*) as total_logs,
    COUNT(DISTINCT user_id) as usuarios_unicos,
    MAX(timestamp) as ultima_atividade
FROM audit_logs
WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY context
ORDER BY total_logs DESC;

-- Logs de auditoria por empresa (últimos 7 dias)
SELECT
    b.name as empresa,
    al.context,
    COUNT(*) as total_logs,
    MIN(al.timestamp) as primeiro_log,
    MAX(al.timestamp) as ultimo_log
FROM audit_logs al
JOIN business b ON al.business_id = b.id
WHERE al.timestamp >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY b.id, b.name, al.context
ORDER BY b.name, total_logs DESC;

-- =====================================================
-- 3. MONITORAMENTO DE PERFORMANCE
-- =====================================================

-- Tamanho das tabelas
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('business', 'users', 'audit_logs')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Índices mais utilizados
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as scans,
    pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
    AND tablename IN ('business', 'users', 'audit_logs')
ORDER BY idx_scan DESC;

-- Queries mais lentas (últimas 24h)
SELECT
    query,
    calls,
    total_time / 1000 as total_time_seconds,
    mean_time / 1000 as mean_time_ms,
    rows
FROM pg_stat_statements
WHERE query LIKE '%audit_logs%'
    OR query LIKE '%business%'
    OR query LIKE '%users%'
ORDER BY total_time DESC
LIMIT 10;

-- =====================================================
-- 4. LIMPEZA E MANUTENÇÃO
-- =====================================================

-- Limpar logs antigos (manter apenas últimos 90 dias)
-- CUIDADO: Execute apenas se tiver backup!
/*
DELETE FROM audit_logs
WHERE timestamp < CURRENT_DATE - INTERVAL '90 days';
*/

-- Reindexar tabelas (execute durante manutenção)
-- ANALYZE business;
-- ANALYZE users;
-- ANALYZE audit_logs;
-- REINDEX TABLE CONCURRENTLY audit_logs;

-- =====================================================
-- 5. BACKUP E RECUPERAÇÃO
-- =====================================================

-- Script para backup das tabelas principais
/*
-- Backup completo
pg_dump -h localhost -U username -d kaora_db \
    -t business -t users -t audit_logs \
    --no-owner --no-privileges \
    > kaora_backup_$(date +%Y%m%d_%H%M%S).sql

-- Backup apenas da estrutura
pg_dump -h localhost -U username -d kaora_db \
    -t business -t users -t audit_logs \
    --schema-only --no-owner --no-privileges \
    > kaora_schema_backup_$(date +%Y%m%d_%H%M%S).sql
*/

-- =====================================================
-- 6. ALERTAS E MONITORAMENTO
-- =====================================================

-- Empresas sem atividade nos últimos 30 dias
SELECT
    b.name as empresa,
    b.email,
    b.created_at,
    MAX(al.timestamp) as ultima_atividade,
    EXTRACT(DAY FROM CURRENT_TIMESTAMP - MAX(al.timestamp)) as dias_sem_atividade
FROM business b
LEFT JOIN audit_logs al ON b.id = al.business_id
WHERE b.active = true
GROUP BY b.id, b.name, b.email, b.created_at
HAVING MAX(al.timestamp) IS NULL
    OR MAX(al.timestamp) < CURRENT_DATE - INTERVAL '30 days'
ORDER BY ultima_atividade NULLS FIRST;

-- Usuários com muitas tentativas de acesso (possível segurança)
SELECT
    u.name as usuario,
    u.email,
    b.name as empresa,
    COUNT(*) as total_logs_erro,
    MAX(al.timestamp) as ultimo_erro
FROM audit_logs al
JOIN users u ON al.user_id = u.id
JOIN business b ON u.business_id = b.id
WHERE al.context LIKE '%ERROR%'
    OR al.context LIKE '%FAILED%'
    OR al.details LIKE '%erro%'
    OR al.details LIKE '%failed%'
GROUP BY u.id, u.name, u.email, b.name
HAVING COUNT(*) > 10
ORDER BY total_logs_erro DESC;

-- =====================================================
-- 7. RELATÓRIOS EXECUTIVOS
-- =====================================================

-- Resumo diário de atividades
SELECT
    DATE(timestamp) as data,
    context,
    COUNT(*) as total_atividades,
    COUNT(DISTINCT user_id) as usuarios_ativos,
    COUNT(DISTINCT business_id) as empresas_ativas
FROM audit_logs
WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(timestamp), context
ORDER BY data DESC, total_atividades DESC;

-- Top empresas por atividade
SELECT
    b.name as empresa,
    COUNT(al.id) as total_logs,
    COUNT(DISTINCT al.user_id) as usuarios_ativos,
    MIN(al.timestamp) as primeira_atividade,
    MAX(al.timestamp) as ultima_atividade
FROM business b
JOIN audit_logs al ON b.id = al.business_id
WHERE al.timestamp >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY b.id, b.name
ORDER BY total_logs DESC
LIMIT 10;

-- =====================================================
-- 8. HEALTH CHECKS
-- =====================================================

-- Verificar integridade das tabelas
SELECT
    schemaname,
    tablename,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze,
    vacuum_count,
    autovacuum_count,
    analyze_count,
    autoanalyze_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
    AND tablename IN ('business', 'users', 'audit_logs');

-- Verificar locks ativos
SELECT
    locktype,
    relation::regclass as tabela,
    mode,
    granted,
    pid,
    usename,
    application_name,
    query_start,
    state_change
FROM pg_locks l
JOIN pg_stat_activity a ON l.pid = a.pid
WHERE l.relation IN (
    (SELECT oid FROM pg_class WHERE relname IN ('business', 'users', 'audit_logs'))
)
ORDER BY query_start;

-- =====================================================
-- FIM DAS CONSULTAS DE MONITORAMENTO
-- =====================================================
