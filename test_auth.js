// Script para testar a autenticação refatorada
const fetch = require('node-fetch');

async function testAuthentication() {
  console.log('🧪 Testando autenticação refatorada...\n');

  // 1. Teste com senha correta
  console.log('1️⃣ Teste com senha correta:');
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@kaora.com',
        password: '12345678'
      })
    });

    const result = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', result);
    
    if (response.status === 200) {
      console.log('✅ Senha correta: LOGIN AUTORIZADO');
    } else {
      console.log('❌ Senha correta: LOGIN NEGADO (erro!)');
    }
  } catch (error) {
    console.log('❌ Erro na requisição:', error.message);
  }

  console.log('\n---\n');

  // 2. Teste com senha incorreta
  console.log('2️⃣ Teste com senha INCORRETA:');
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@kaora.com',
        password: 'senhaerrada123'
      })
    });

    const result = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', result);
    
    if (response.status === 401) {
      console.log('✅ Senha incorreta: LOGIN NEGADO (correto!)');
    } else if (response.status === 200) {
      console.log('❌ Senha incorreta: LOGIN AUTORIZADO (BUG CRÍTICO!)');
    } else {
      console.log('⚠️ Resultado inesperado');
    }
  } catch (error) {
    console.log('❌ Erro na requisição:', error.message);
  }

  console.log('\n---\n');

  // 3. Teste com email inexistente
  console.log('3️⃣ Teste com email inexistente:');
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'naoexiste@exemplo.com',
        password: '12345678'
      })
    });

    const result = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', result);
    
    if (response.status === 401) {
      console.log('✅ Email inexistente: LOGIN NEGADO (correto!)');
    } else if (response.status === 200) {
      console.log('❌ Email inexistente: LOGIN AUTORIZADO (BUG!)');
    } else {
      console.log('⚠️ Resultado inesperado');
    }
  } catch (error) {
    console.log('❌ Erro na requisição:', error.message);
  }
}

// Executar o teste
testAuthentication();
