export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email e senha são obrigatórios" }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (password.length < 8) {
      return new Response(
        JSON.stringify({ error: "A senha deve ter pelo menos 8 caracteres" }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    try {
      console.log('🔍 [LOGIN] Tentativa de login:', email);
      
      // Usar a Clean Architecture - consumir o AuthenticationService
      const { getContainer, TOKENS, AuthenticationService } = await import('@kaora/application');
      const container = getContainer();
      
      const authService = container.get<InstanceType<typeof AuthenticationService>>(TOKENS.AUTH_SERVICE);
      
      // Delegar toda a lógica de autenticação para o serviço
      const result = await authService.authenticate({ email, password });

      if (!result.success) {
        return new Response(
          JSON.stringify({ error: result.error }),
          { 
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      // Autenticação bem-sucedida
      console.log('✅ [API] Usuário autenticado via AuthenticationService!');

      return new Response(
        JSON.stringify({
          ...result.user,
          source: 'CLEAN_ARCHITECTURE_AUTH_SERVICE'
        }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );

    } catch (err: any) {
      console.error('❌ Erro na autenticação:', err);
      return new Response(
        JSON.stringify({ error: "Erro na autenticação" }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error) {
    console.error("❌ Erro no endpoint de login:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
