import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

// Verificar se as variáveis de ambiente estão configuradas
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error('❌ [NEXTAUTH] GOOGLE_CLIENT_ID ou GOOGLE_CLIENT_SECRET não configurados no .env');
}

if (!process.env.NEXTAUTH_SECRET) {
  console.warn('⚠️ [NEXTAUTH] NEXTAUTH_SECRET não configurado no .env');
}

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          // Chamar a API de login do seu backend
          const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (response.ok) {
            const user = await response.json();
            // Retornar o objeto do usuário se as credenciais estão corretas
            return {
              id: user.id,
              email: user.email,
              name: user.name,
            };
          } else {
            // Se as credenciais estão incorretas, retornar null
            return null;
          }
        } catch (error) {
          console.error('❌ [NEXTAUTH] Erro na autenticação com credentials:', error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
    error: "/auth/login"
  },
  callbacks: {
    async signIn({ user, account, profile }: any) {
      try {
        // Se for login com Google, verificar se já existe uma empresa para este usuário
        if (account?.provider === "google" && user?.email) {
          // Verificar se o usuário já tem uma empresa cadastrada
          const checkResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/business/check-user-business?email=${encodeURIComponent(user.email)}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (checkResponse.ok) {
            const result = await checkResponse.json();
            if (result.hasCompany) {
              // Usuário já tem empresa, pode fazer login normalmente
              console.log('✅ [NEXTAUTH] Usuário já possui empresa cadastrada');
              return true;
            }
          }
          
          // Usuário ainda não tem empresa, precisará cadastrar
          console.log('ℹ️ [NEXTAUTH] Usuário precisa cadastrar empresa');
          return true;
        }
        
        // Se for login com credentials, permitir sempre (já foi validado no authorize)
        if (account?.provider === "credentials") {
          console.log('✅ [NEXTAUTH] Login com credentials autorizado');
          return true;
        }
        
        return true;
      } catch (error) {
        console.error('❌ [NEXTAUTH] Erro no signIn callback:', error);
        return true; // Permitir login mesmo com erro na verificação
      }
    },
    async redirect({ url, baseUrl }: any) {
      try {
        console.log('🔀 [NEXTAUTH REDIRECT] URL:', url, 'BaseURL:', baseUrl);
        
        // Verificar se é um callback de Google OAuth
        if (url.includes("/api/auth/callback/google")) {
          console.log('✅ [NEXTAUTH REDIRECT] Detectado callback do Google, redirecionando para company-data');
          return `${baseUrl}/auth/company-data`;
        }
        
        // Para login com credentials, redirecionar para a página principal
        if (url.includes("/api/auth/callback/credentials")) {
          console.log('✅ [NEXTAUTH REDIRECT] Detectado callback de credentials, redirecionando para página principal');
          return baseUrl;
        }
        
        console.log('🔀 [NEXTAUTH REDIRECT] Outros casos, URL:', url);
        
        // Para outros casos, redirecionar para a URL solicitada ou home
        if (url.startsWith(baseUrl)) return url;
        return baseUrl;
      } catch (error) {
        console.error('❌ [NEXTAUTH] Erro no redirect callback:', error);
        return baseUrl;
      }
    },
    async session({ session, token }: any) {
      try {
        // Adicionar informações adicionais à sessão se necessário
        if (session?.user?.email) {
          // Verificar se o usuário tem empresa cadastrada
          const checkResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/business/check-user-business?email=${encodeURIComponent(session.user.email)}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (checkResponse.ok) {
            const result = await checkResponse.json();
            session.user.hasCompany = result.hasCompany;
            session.user.companyId = result.companyId;
          }
        }
        
        return session;
      } catch (error) {
        console.error('❌ [NEXTAUTH] Erro no session callback:', error);
        return session;
      }
    },
    async jwt({ token, user, account }: any) {
      // Adicionar informações do usuário ao token se necessário
      if (user) {
        token.email = user.email;
        token.name = user.name;
      }
      
      return token;
    },
  },
};
