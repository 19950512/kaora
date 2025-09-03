-- =====================================================
-- SCRIPT DE CORREÇÃO - Kaora Database
-- Corrige problemas de colunas faltantes
-- =====================================================

-- Verificar se a tabela audit_logs existe e tem todas as colunas necessárias
DO $$
DECLARE
    column_count INTEGER;
BEGIN
    -- Verificar se a coluna ip_address existe
    SELECT COUNT(*) INTO column_count
    FROM information_schema.columns
    WHERE table_name = 'audit_logs'
      AND column_name = 'ip_address'
      AND table_schema = 'public';

    IF column_count = 0 THEN
        RAISE NOTICE 'Adicionando coluna ip_address à tabela audit_logs...';
        ALTER TABLE audit_logs ADD COLUMN ip_address INET;
    ELSE
        RAISE NOTICE 'Coluna ip_address já existe na tabela audit_logs.';
    END IF;

    -- Verificar se a coluna user_agent existe
    SELECT COUNT(*) INTO column_count
    FROM information_schema.columns
    WHERE table_name = 'audit_logs'
      AND column_name = 'user_agent'
      AND table_schema = 'public';

    IF column_count = 0 THEN
        RAISE NOTICE 'Adicionando coluna user_agent à tabela audit_logs...';
        ALTER TABLE audit_logs ADD COLUMN user_agent TEXT;
    ELSE
        RAISE NOTICE 'Coluna user_agent já existe na tabela audit_logs.';
    END IF;

    -- Verificar se a coluna additional_data existe
    SELECT COUNT(*) INTO column_count
    FROM information_schema.columns
    WHERE table_name = 'audit_logs'
      AND column_name = 'additional_data'
      AND table_schema = 'public';

    IF column_count = 0 THEN
        RAISE NOTICE 'Adicionando coluna additional_data à tabela audit_logs...';
        ALTER TABLE audit_logs ADD COLUMN additional_data JSONB;
    ELSE
        RAISE NOTICE 'Coluna additional_data já existe na tabela audit_logs.';
    END IF;

    -- Verificar se a coluna updated_fields existe
    SELECT COUNT(*) INTO column_count
    FROM information_schema.columns
    WHERE table_name = 'audit_logs'
      AND column_name = 'updated_fields'
      AND table_schema = 'public';

    IF column_count = 0 THEN
        RAISE NOTICE 'Adicionando coluna updated_fields à tabela audit_logs...';
        ALTER TABLE audit_logs ADD COLUMN updated_fields TEXT;
    ELSE
        RAISE NOTICE 'Coluna updated_fields já existe na tabela audit_logs.';
    END IF;

    RAISE NOTICE 'Verificação e correção concluída!';
END $$;

-- =====================================================
-- RECRIAR ÍNDICES IMPORTANTES (caso tenham sido perdidos)
-- =====================================================

-- Índices para performance (otimizados para consultas de auditoria)
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_context ON audit_logs(context);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_address ON audit_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_agent ON audit_logs(user_agent);
CREATE INDEX IF NOT EXISTS idx_audit_logs_business_id ON audit_logs(business_id);

-- Índice composto para consultas de auditoria por empresa e período
CREATE INDEX IF NOT EXISTS idx_audit_logs_business_context_timestamp
    ON audit_logs(business_id, context, timestamp DESC);

-- Índice para busca por período
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp_range
    ON audit_logs(timestamp DESC)
    WHERE timestamp >= CURRENT_TIMESTAMP - INTERVAL '90 days';

-- =====================================================
-- VERIFICAR ESTRUTURA FINAL
-- =====================================================

-- Mostrar estrutura da tabela audit_logs
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'audit_logs'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Contar registros na tabela
SELECT
    COUNT(*) as total_audit_logs,
    COUNT(DISTINCT user_id) as usuarios_unicos,
    COUNT(DISTINCT business_id) as empresas_unicas,
    MIN(timestamp) as primeiro_log,
    MAX(timestamp) as ultimo_log
FROM audit_logs;

-- =====================================================
-- LOG DA CORREÇÃO
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'Script de correção executado com sucesso!';
    RAISE NOTICE 'Data: %', CURRENT_TIMESTAMP;
    RAISE NOTICE 'Verifique os logs acima para confirmar as correções aplicadas.';
END $$;

COMMIT;
