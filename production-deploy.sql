-- =====================================================
-- SCRIPT SQL PARA DEPLOY EM PRODUÇÃO - KAORA
-- Sistema de Locação com Auditoria
-- =====================================================
-- Data: 28 de Agosto de 2025
-- Versão: 1.0.0
-- Descrição: Script completo para criação das tabelas
--           do sistema Kaora em ambiente de produção
-- =====================================================

-- =====================================================
-- 1. HABILITAR EXTENSÕES NECESSÁRIAS
-- =====================================================

-- Extensão para geração automática de UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Extensão para busca por similaridade de texto (trigramas)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- 2. TABELA: business (Empresas/Tenants)
-- =====================================================

CREATE TABLE IF NOT EXISTS business (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    document VARCHAR(20) UNIQUE NOT NULL, -- CPF/CNPJ
    phone VARCHAR(20) NOT NULL,
    whatsapp VARCHAR(20) NOT NULL,
    logo_url VARCHAR(555),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Comentários para documentação
COMMENT ON TABLE business IS 'Tabela que armazena as empresas (tenants) do sistema multitenant';
COMMENT ON COLUMN business.id IS 'Identificador único da empresa (UUID)';
COMMENT ON COLUMN business.name IS 'Nome da empresa';
COMMENT ON COLUMN business.email IS 'Email da empresa (único no sistema)';
COMMENT ON COLUMN business.document IS 'CPF ou CNPJ da empresa (único no sistema)';
COMMENT ON COLUMN business.phone IS 'Telefone da empresa';
COMMENT ON COLUMN business.whatsapp IS 'WhatsApp da empresa';
COMMENT ON COLUMN business.logo_url IS 'URL do logo da empresa (armazenado no R2/Cloudflare)';
COMMENT ON COLUMN business.active IS 'Indica se a empresa está ativa no sistema';
COMMENT ON COLUMN business.created_at IS 'Data/hora de criação do registro';
COMMENT ON COLUMN business.updated_at IS 'Data/hora da última atualização';

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_business_document ON business(document);
CREATE INDEX IF NOT EXISTS idx_business_email ON business(email);
CREATE INDEX IF NOT EXISTS idx_business_active ON business(active);
CREATE INDEX IF NOT EXISTS idx_business_name_trgm ON business USING gin(name gin_trgm_ops);

-- =====================================================
-- 3. TABELA: users (Usuários das empresas)
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES business(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    document VARCHAR(20) NOT NULL, -- CPF/CNPJ do usuário
    phone VARCHAR(20) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Constraint para email único por empresa (multitenant)
    UNIQUE(business_id, email)
);

-- Comentários para documentação
COMMENT ON TABLE users IS 'Tabela que armazena os usuários do sistema (multitenant por empresa)';
COMMENT ON COLUMN users.id IS 'Identificador único do usuário (UUID)';
COMMENT ON COLUMN users.business_id IS 'Referência para a empresa do usuário (FK)';
COMMENT ON COLUMN users.name IS 'Nome completo do usuário';
COMMENT ON COLUMN users.email IS 'Email do usuário (único por empresa)';
COMMENT ON COLUMN users.password_hash IS 'Hash da senha do usuário (Argon2)';
COMMENT ON COLUMN users.document IS 'CPF ou CNPJ do usuário';
COMMENT ON COLUMN users.phone IS 'Telefone do usuário';
COMMENT ON COLUMN users.active IS 'Indica se o usuário está ativo';
COMMENT ON COLUMN users.created_at IS 'Data/hora de criação do registro';
COMMENT ON COLUMN users.updated_at IS 'Data/hora da última atualização';

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_users_business_id ON users(business_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_document ON users(document);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(active);
CREATE INDEX IF NOT EXISTS idx_users_business_email ON users(business_id, email);

-- =====================================================
-- 4. TABELA: audit_logs (Logs de auditoria)
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    context VARCHAR(50) NOT NULL, -- BUSINESS_CREATE, USER_CREATE, etc
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    details TEXT,
    ip_address INET, -- Endereço IP do usuário
    user_agent TEXT, -- User-Agent do navegador/dispositivo
    business_id UUID NOT NULL REFERENCES business(id) ON DELETE CASCADE,
    additional_data JSONB, -- Dados adicionais em formato JSON
    updated_fields TEXT -- JSON dos campos alterados
);

-- Comentários para documentação
COMMENT ON TABLE audit_logs IS 'Tabela que armazena logs de auditoria do sistema';
COMMENT ON COLUMN audit_logs.id IS 'Identificador único do log (UUID)';
COMMENT ON COLUMN audit_logs.context IS 'Contexto da ação (enum: BUSINESS_CREATE, USER_CREATE, etc)';
COMMENT ON COLUMN audit_logs.user_id IS 'Usuário que executou a ação (FK)';
COMMENT ON COLUMN audit_logs.timestamp IS 'Timestamp da ação';
COMMENT ON COLUMN audit_logs.details IS 'Detalhes da ação executada';
COMMENT ON COLUMN audit_logs.updated_fields IS 'JSON com campos alterados (para updates)';
COMMENT ON COLUMN audit_logs.ip_address IS 'Endereço IP do usuário que executou a ação';
COMMENT ON COLUMN audit_logs.user_agent IS 'User-Agent do usuário que executou a ação';
COMMENT ON COLUMN audit_logs.business_id IS 'Referência para a empresa do usuário (FK)';
COMMENT ON COLUMN audit_logs.additional_data IS 'Dados adicionais em formato JSONB';

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
-- 5. FUNÇÕES DE TRIGGER PARA UPDATED_AT
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_business_updated_at
    BEFORE UPDATE ON business
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. FUNÇÕES ÚTEIS PARA AUDITORIA
-- =====================================================

-- Função para limpar logs antigos (manter apenas últimos 2 anos)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM audit_logs
    WHERE timestamp < CURRENT_TIMESTAMP - INTERVAL '2 years';

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE 'plpgsql';

-- Função para obter estatísticas de auditoria por empresa
CREATE OR REPLACE FUNCTION get_audit_stats_by_business(p_business_id UUID)
RETURNS TABLE (
    context VARCHAR(50),
    total_logs BIGINT,
    last_activity TIMESTAMPTZ,
    unique_users BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        al.context,
        COUNT(*) as total_logs,
        MAX(al.timestamp) as last_activity,
        COUNT(DISTINCT al.user_id) as unique_users
    FROM audit_logs al
    WHERE al.business_id = p_business_id
    GROUP BY al.context
    ORDER BY total_logs DESC;
END;
$$ LANGUAGE 'plpgsql';

-- =====================================================
-- 7. POLÍTICAS DE SEGURANÇA (RLS - Row Level Security)
-- =====================================================

-- Habilitar RLS nas tabelas
ALTER TABLE business ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Política para business (cada empresa vê apenas seus dados)
CREATE POLICY business_isolation_policy ON business
    FOR ALL USING (true); -- Será controlado pela aplicação

-- Política para users (usuários veem apenas usuários da mesma empresa)
CREATE POLICY users_business_isolation ON users
    FOR ALL USING (
        business_id IN (
            SELECT business_id FROM users WHERE id = current_setting('app.current_user_id')::UUID
        )
    );

-- Política para audit_logs (logs são visíveis apenas para a empresa do usuário)
CREATE POLICY audit_logs_business_isolation ON audit_logs
    FOR ALL USING (
        business_id IN (
            SELECT business_id FROM users WHERE id = current_setting('app.current_user_id')::UUID
        )
    );

-- =====================================================
-- 8. DADOS INICIAIS (OPCIONAL - DESCOMENTE SE NECESSÁRIO)
-- =====================================================

/*
-- Empresa exemplo (descomente para inserir dados de teste)
INSERT INTO business (id, name, email, document, phone, whatsapp, active)
VALUES (
    '969539a2-65b8-4480-a42b-afdff2b63324',
    'Slipksoftware',
    'matheus@objetivasoftware.com.br',
    '84167670097',
    '11999999999',
    '54984192072',
    true
) ON CONFLICT (email) DO NOTHING;

-- Usuário exemplo (descomente para inserir dados de teste)
-- IMPORTANTE: Substitua a senha hash por uma hash real do Argon2
INSERT INTO users (id, business_id, name, email, password_hash, document, phone, active)
VALUES (
    'user-uuid-aqui',
    '969539a2-65b8-4480-a42b-afdff2b63324',
    'Matheus Silva',
    'matheus@objetivasoftware.com.br',
    '$argon2id$v=19$m=65536,t=3,p=4$hash_aqui', -- SUBSTITUA POR HASH REAL
    '84167670097',
    '11999999999',
    true
) ON CONFLICT (business_id, email) DO NOTHING;
*/

-- =====================================================
-- 9. CONFIGURAÇÕES DE PERFORMANCE
-- =====================================================

-- Configurar autovacuum para tabelas de auditoria
ALTER TABLE audit_logs SET (
    autovacuum_vacuum_scale_factor = 0.1,
    autovacuum_vacuum_threshold = 1000,
    autovacuum_analyze_scale_factor = 0.05,
    autovacuum_analyze_threshold = 500
);

-- Configurar fillfactor para tabelas com updates frequentes
ALTER TABLE business SET (fillfactor = 80);
ALTER TABLE users SET (fillfactor = 80);

-- =====================================================
-- 10. LOG DA INSTALAÇÃO
-- =====================================================

-- Registrar que o script foi executado
DO $$
BEGIN
    RAISE NOTICE 'Script SQL de produção do Kaora executado com sucesso!';
    RAISE NOTICE 'Versão: 1.0.0 - Data: 28/08/2025';
    RAISE NOTICE 'Próximos passos:';
    RAISE NOTICE '1. Configurar variáveis de ambiente';
    RAISE NOTICE '2. Executar migrações do Prisma (npx prisma migrate deploy)';
    RAISE NOTICE '3. Gerar cliente Prisma (npx prisma generate)';
    RAISE NOTICE '4. Testar conexão com o banco';
END $$;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

COMMIT;
