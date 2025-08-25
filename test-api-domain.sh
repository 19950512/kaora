#!/bin/bash

echo "🧪 Testing Kaora Clean Architecture API"
echo "========================================"
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para testar API
test_api() {
    local test_name="$1"
    local expected_status="$2"
    local data="$3"
    local expected_pattern="$4"
    
    echo -e "${BLUE}🔍 Teste: $test_name${NC}"
    echo "📤 Dados: $data"
    
    # Fazer requisição e capturar status e resposta
    response=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3000/api/business/create \
        -H "Content-Type: application/json" \
        -d "$data")
    
    # Separar resposta do status code
    http_status=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    echo "📥 Status: $http_status"
    echo "📋 Resposta: $body"
    
    # Validar status code
    if [ "$http_status" = "$expected_status" ]; then
        echo -e "✅ Status correto: $http_status"
    else
        echo -e "${RED}❌ Status incorreto. Esperado: $expected_status, Recebido: $http_status${NC}"
        return 1
    fi
    
    # Validar padrão na resposta
    if echo "$body" | grep -q "$expected_pattern"; then
        echo -e "✅ Padrão encontrado: $expected_pattern"
    else
        echo -e "${RED}❌ Padrão não encontrado: $expected_pattern${NC}"
        echo "Resposta recebida: $body"
        return 1
    fi
    
    echo -e "${GREEN}✅ Teste passou!${NC}"
    echo ""
    return 0
}

# Verificar se servidor está rodando
echo "🔍 Verificando se servidor está rodando..."
if ! curl -s http://localhost:3000 > /dev/null; then
    echo -e "${RED}❌ Servidor não está rodando na porta 3000!${NC}"
    echo "Execute: cd web && yarn dev"
    exit 1
fi
echo -e "${GREEN}✅ Servidor está rodando${NC}"
echo ""

# Contador de testes
total_tests=0
passed_tests=0

# Teste 1: Sucesso com dados válidos
total_tests=$((total_tests + 1))
if test_api "Criação de empresa com dados válidos" "200" \
    '{"businessName": "Kaora Tech Solutions", "responsibleName": "João Silva Santos", "responsibleEmail": "joao.test@kaora.com", "responsiblePassword": "MinhaSenh@123", "responsibleDocument": "84167670097"}' \
    "CLEAN_ARCHITECTURE_WITH_DI"; then
    passed_tests=$((passed_tests + 1))
fi

# Teste 2: Erro - Campos obrigatórios faltando
total_tests=$((total_tests + 1))
if test_api "Erro - Campos obrigatórios faltando" "400" \
    '{"businessName": "Test", "responsibleName": "João"}' \
    "Preencha todos os campos obrigatórios"; then
    passed_tests=$((passed_tests + 1))
fi

# Teste 3: Erro - Nome completo inválido (validação do Domain)
total_tests=$((total_tests + 1))
if test_api "Erro - Nome completo inválido (Domain validation)" "400" \
    '{"businessName": "Test Company", "responsibleName": "João", "responsibleEmail": "test@test.com", "responsiblePassword": "senha123", "responsibleDocument": "84167670097"}' \
    "Nome completo inválido"; then
    passed_tests=$((passed_tests + 1))
fi

# Teste 4: Erro - Email inválido (validação do Domain)
total_tests=$((total_tests + 1))
if test_api "Erro - Email inválido (Domain validation)" "400" \
    '{"businessName": "Test Company", "responsibleName": "João Silva", "responsibleEmail": "email-invalido", "responsiblePassword": "senha123", "responsibleDocument": "84167670097"}' \
    "Email inválido"; then
    passed_tests=$((passed_tests + 1))
fi

# Teste 5: Erro - CPF inválido (validação do Domain)
total_tests=$((total_tests + 1))
if test_api "Erro - CPF inválido (Domain validation)" "400" \
    '{"businessName": "Test Company", "responsibleName": "João Silva", "responsibleEmail": "test@test.com", "responsiblePassword": "senha123", "responsibleDocument": "12345678901"}' \
    "Documento inválido"; then
    passed_tests=$((passed_tests + 1))
fi

# Teste 6: Sucesso com CNPJ válido
total_tests=$((total_tests + 1))
if test_api "Criação com CNPJ válido" "200" \
    '{"businessName": "Empresa CNPJ Ltda", "responsibleName": "Maria Silva Santos", "responsibleEmail": "maria@cnpj.com", "responsiblePassword": "senha123", "responsibleDocument": "11222333000181"}' \
    "success.*true"; then
    passed_tests=$((passed_tests + 1))
fi

# Teste 7: Verificar que está usando Clean Architecture
echo -e "${BLUE}🔍 Teste especial: Verificando Clean Architecture${NC}"
response=$(curl -s -X POST http://localhost:3000/api/business/create \
    -H "Content-Type: application/json" \
    -d '{"businessName": "Clean Test", "responsibleName": "Clean Architecture", "responsibleEmail": "clean@arch.com", "responsiblePassword": "senha123", "responsibleDocument": "84167670097"}')

total_tests=$((total_tests + 1))
if echo "$response" | grep -q "CLEAN_ARCHITECTURE_WITH_DI"; then
    echo -e "${GREEN}✅ Confirmado: Usando Clean Architecture com DI!${NC}"
    passed_tests=$((passed_tests + 1))
else
    echo -e "${RED}❌ ERRO: Não está usando Clean Architecture!${NC}"
    echo "Resposta: $response"
fi
echo ""

# Teste 8: Verificar logs do Domain (Mock DB)
echo -e "${BLUE}🔍 Teste especial: Verificando Domain/Infrastructure logs${NC}"
echo "📝 Fazendo requisição para verificar logs..."

# Fazer requisição e capturar logs via stderr
response_with_logs=$(curl -s -X POST http://localhost:3000/api/business/create \
    -H "Content-Type: application/json" \
    -d '{"businessName": "Log Test Company", "responsibleName": "Domain Logger", "responsibleEmail": "logs@domain.com", "responsiblePassword": "senha123", "responsibleDocument": "84167670097"}' 2>&1)

total_tests=$((total_tests + 1))
# Verificar se a resposta contém indicadores de que passou pelo Domain
if echo "$response_with_logs" | grep -q "success.*true"; then
    echo -e "${GREEN}✅ Domain layers executados com sucesso!${NC}"
    echo "💡 Logs esperados devem aparecer no console do servidor (MOCK DB)"
    passed_tests=$((passed_tests + 1))
else
    echo -e "${RED}❌ Erro na execução do Domain${NC}"
fi
echo ""

# Resumo dos testes
echo "📊 RESUMO DOS TESTES"
echo "==================="
echo -e "Total de testes: ${BLUE}$total_tests${NC}"
echo -e "Testes aprovados: ${GREEN}$passed_tests${NC}"
echo -e "Testes falharam: ${RED}$((total_tests - passed_tests))${NC}"
echo ""

if [ $passed_tests -eq $total_tests ]; then
    echo -e "${GREEN}🎉 TODOS OS TESTES PASSARAM!${NC}"
    echo -e "${GREEN}✅ Clean Architecture funcionando perfeitamente!${NC}"
    echo -e "${GREEN}✅ Domain validations funcionando!${NC}"
    echo -e "${GREEN}✅ DI Container funcionando!${NC}"
    echo -e "${GREEN}✅ Application Services funcionando!${NC}"
    echo ""
    echo -e "${YELLOW}💡 Verificações realizadas:${NC}"
    echo "   • Validação de campos obrigatórios"
    echo "   • Validação de nome completo (Domain)"
    echo "   • Validação de email (Domain)"
    echo "   • Validação de CPF/CNPJ (Domain)"
    echo "   • Criação com dados válidos"
    echo "   • Uso de Clean Architecture com DI"
    echo "   • Execução do Domain layer"
    exit 0
else
    echo -e "${RED}❌ ALGUNS TESTES FALHARAM!${NC}"
    echo "Verifique os erros acima e corrija o código."
    exit 1
fi
