import { UserRepository } from '@kaora/domain';

export interface AuthenticationRequest {
  email: string;
  password: string;
}

export interface AuthenticationResponse {
  success: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    businessId: string;
    business?: {
      id: string;
      name: string;
    };
  };
  error?: string;
}

export class AuthenticationService {
  constructor(private userRepository?: UserRepository) {}

  async authenticate(request: AuthenticationRequest): Promise<AuthenticationResponse> {
    try {
      const { email, password } = request;

      console.log('🔍 [AUTH_SERVICE] Tentativa de autenticação:', email);

      // Se o userRepository não foi injetado, usar a abordagem via fallback
      if (!this.userRepository) {
        return await this.authenticateWithFallback(email, password);
      }

      // Verificar se o userRepository tem o método necessário
      if (!this.userRepository.findByEmailWithBusiness) {
        return await this.authenticateWithFallback(email, password);
      }

      // Usar o repositório injetado
      const result = await this.userRepository.findByEmailWithBusiness(email);
      
      if (!result || !result.user) {
        console.log('❌ [AUTH_SERVICE] Usuário não encontrado:', email);
        return {
          success: false,
          error: 'Email ou senha inválidos'
        };
      }

      const { user, business } = result;

      // Verificar se o usuário está ativo
      if (!user.active) {
        console.log('❌ [AUTH_SERVICE] Usuário inativo:', email);
        return {
          success: false,
          error: 'Usuário inativo'
        };
      }

      // VALIDAÇÃO REAL DA SENHA - usar a lógica do PasswordHash
      const isPasswordValid = await this.verifyPassword(password, user.passwordHash);
      
      if (!isPasswordValid) {
        console.log('❌ [AUTH_SERVICE] Senha inválida para:', email);
        return {
          success: false,
          error: 'Email ou senha inválidos'
        };
      }

      // Autenticação bem-sucedida
      console.log('✅ [AUTH_SERVICE] Usuário autenticado com sucesso!', user.email.toString());

      return {
        success: true,
        user: {
          id: user.id.toString(),
          name: user.name.toString(),
          email: user.email.toString(),
          businessId: user.businessId.toString(),
          business: business ? {
            id: business.id,
            name: business.name
          } : undefined
        }
      };

    } catch (error: any) {
      console.error('❌ [AUTH_SERVICE] Erro na autenticação:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  private async authenticateWithFallback(email: string, password: string): Promise<AuthenticationResponse> {
    try {
      console.log('⚠️ [AUTH_SERVICE] Usando fallback direto ao banco de dados');
      
      // Importar diretamente do database provider como fallback
      const infrastructureModule = await import('@kaora/infrastructure');
      const prisma = infrastructureModule.DatabaseProvider.getInstance();
      
      // Buscar usuário pelo email com dados da empresa
      const userWithBusiness = await prisma.user.findFirst({
        where: { email },
        include: { business: true }
      });

      if (!userWithBusiness) {
        console.log('❌ [AUTH_SERVICE] Usuário não encontrado:', email);
        return {
          success: false,
          error: 'Email ou senha inválidos'
        };
      }

      // Verificar se o usuário está ativo
      if (!userWithBusiness.active) {
        console.log('❌ [AUTH_SERVICE] Usuário inativo:', email);
        return {
          success: false,
          error: 'Usuário inativo'
        };
      }

      // VALIDAÇÃO REAL DA SENHA
      const isPasswordValid = await this.verifyPassword(password, userWithBusiness.passwordHash);
      
      console.log('🔐 [AUTH_SERVICE] Verificação de senha:', {
        email,
        senhaRecebida: password,
        hashArmazenado: userWithBusiness.passwordHash,
        senhaValida: isPasswordValid
      });
      
      if (!isPasswordValid) {
        console.log('❌ [AUTH_SERVICE] Senha inválida para:', email);
        return {
          success: false,
          error: 'Email ou senha inválidos'
        };
      }

      // Autenticação bem-sucedida
      console.log('✅ [AUTH_SERVICE] Usuário autenticado com sucesso via fallback!', userWithBusiness.email);

      return {
        success: true,
        user: {
          id: userWithBusiness.id,
          name: userWithBusiness.name,
          email: userWithBusiness.email,
          businessId: userWithBusiness.businessId,
          business: userWithBusiness.business ? {
            id: userWithBusiness.business.id,
            name: userWithBusiness.business.name
          } : undefined
        }
      };

    } catch (error: any) {
      console.error('❌ [AUTH_SERVICE] Erro no fallback de autenticação:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  private async verifyPassword(password: string, storedHash: string): Promise<boolean> {
    // Usar a mesma lógica do PasswordHash - senha invertida
    const invertedPassword = password.split('').reverse().join('');
    return invertedPassword === storedHash;
  }
}
