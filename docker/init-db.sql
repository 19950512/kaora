-- =====================================================
-- INICIALIZAÇÃO DO BANCO KAORA
-- =====================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- TABELA: business (Empresas/Tenants)
-- =====================================================

CREATE TABLE IF NOT EXISTS business (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    document VARCHAR(20) UNIQUE NOT NULL, -- CPF/CNPJ
    phone VARCHAR(20) NOT NULL,
    whatsapp VARCHAR(20) NOT NULL,
    logo_url VARCHAR(555) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Comentários para auxiliar entendimento
COMMENT ON TABLE business IS 'Tabela que armazena as empresas (tenants) do sistema multitenant';
COMMENT ON COLUMN business.id IS 'Identificador único da empresa';
COMMENT ON COLUMN business.name IS 'Nome da empresa';
COMMENT ON COLUMN business.email IS 'Email da empresa (único no sistema)';
COMMENT ON COLUMN business.document IS 'CPF ou CNPJ da empresa (único no sistema)';
COMMENT ON COLUMN business.phone IS 'Telefone da empresa';
COMMENT ON COLUMN business.whatsapp IS 'WhatsApp da empresa';
COMMENT ON COLUMN business.active IS 'Indica se a empresa está ativa no sistema';

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_business_document ON business(document);
CREATE INDEX IF NOT EXISTS idx_business_email ON business(email);
CREATE INDEX IF NOT EXISTS idx_business_active ON business(active);
CREATE INDEX IF NOT EXISTS idx_business_name_trgm ON business USING gin(name gin_trgm_ops);

-- =====================================================
-- TABELA: users (Usuários das empresas)
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

-- Comentários para auxiliar entendimento
COMMENT ON TABLE users IS 'Tabela que armazena os usuários do sistema (multitenant por empresa)';
COMMENT ON COLUMN users.id IS 'Identificador único do usuário';
COMMENT ON COLUMN users.business_id IS 'Referência para a empresa do usuário';
COMMENT ON COLUMN users.name IS 'Nome completo do usuário';
COMMENT ON COLUMN users.email IS 'Email do usuário (único por empresa)';
COMMENT ON COLUMN users.password_hash IS 'Hash da senha do usuário (Argon2)';
COMMENT ON COLUMN users.document IS 'CPF ou CNPJ do usuário';
COMMENT ON COLUMN users.phone IS 'Telefone do usuário';
COMMENT ON COLUMN users.active IS 'Indica se o usuário está ativo';

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_users_business_id ON users(business_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_document ON users(document);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(active);
CREATE INDEX IF NOT EXISTS idx_users_business_email ON users(business_id, email);

-- =====================================================
-- TABELA: audit_logs (Logs de auditoria)
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    context VARCHAR(50) NOT NULL, -- BUSINESS_CREATE, USER_CREATE, etc
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    details TEXT,
    updated_fields TEXT -- JSON dos campos alterados
);

-- Comentários para auxiliar entendimento
COMMENT ON TABLE audit_logs IS 'Tabela que armazena logs de auditoria do sistema';
COMMENT ON COLUMN audit_logs.id IS 'Identificador único do log';
COMMENT ON COLUMN audit_logs.context IS 'Contexto da ação (enum: BUSINESS_CREATE, USER_CREATE, etc)';
COMMENT ON COLUMN audit_logs.user_id IS 'Usuário que executou a ação';
COMMENT ON COLUMN audit_logs.timestamp IS 'Timestamp da ação';
COMMENT ON COLUMN audit_logs.details IS 'Detalhes da ação executada';
COMMENT ON COLUMN audit_logs.updated_fields IS 'JSON com campos alterados (para updates)';

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_context ON audit_logs(context);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);

-- =====================================================
-- FUNÇÕES DE TRIGGER PARA UPDATED_AT
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_business_updated_at 
    BEFORE UPDATE ON business 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
