-- Script para validar a estrutura do banco de dados
-- Execute este script para verificar se todas as tabelas foram criadas corretamente

-- Verificar se todas as tabelas existem
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Verificar colunas da tabela business
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'business' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar colunas da tabela users  
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar colunas da tabela roles
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'roles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar colunas da tabela audit_logs
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'audit_logs' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar índices criados
SELECT schemaname, tablename, indexname, indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
  AND tablename IN ('business', 'users', 'roles', 'audit_logs')
ORDER BY tablename, indexname;

-- Verificar constraints de foreign key
SELECT tc.table_name, kcu.column_name, ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;
