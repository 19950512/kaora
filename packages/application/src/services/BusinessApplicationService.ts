import { CreateBusiness } from '@kaora/domain';

export interface CreateBusinessRequest {
  businessName: string;
  responsibleName: string;
  responsibleEmail: string;
  responsiblePassword: string;
  responsibleDocument: string;
  businessDocument?: string;
  businessPhone?: string;
  responsiblePhone?: string;
}

export interface CreateBusinessResponse {
  success: boolean;
  message: string;
  businessId: string;
  userId: string;
  businessName: string;
  userEmail: string;
}

export interface CheckUserBusinessResponse {
  hasCompany: boolean;
  companyId: string | null;
  companyName: string | null;
}

export class BusinessApplicationService {
  constructor(
    private createBusinessUseCase: CreateBusiness,
    private userRepository?: any // Aceita userRepository opcional para checkUserBusiness
  ) {}

  async createBusiness(request: CreateBusinessRequest): Promise<CreateBusinessResponse> {
    try {
      const result = await this.createBusinessUseCase.execute({
        businessName: request.businessName,
        responsibleName: request.responsibleName,
        responsibleEmail: request.responsibleEmail,
        responsiblePassword: request.responsiblePassword,
        businessDocument: request.businessDocument,
        responsibleDocument: request.responsibleDocument,
        businessPhone: request.businessPhone || '11999999999',
        responsiblePhone: request.responsiblePhone || '11999999999'
      });

      return {
        success: true,
        message: '🎉 Empresa criada com sucesso!',
        businessId: result.business.id.toString(),
        userId: result.user.id.toString(),
        businessName: result.business.name.toString(),
        userEmail: result.user.email.toString()
      };
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao criar empresa');
    }
  }

  async checkUserBusiness(email: string): Promise<CheckUserBusinessResponse> {
    try {
      // Se o userRepository não foi injetado, usar a abordagem via container
      if (!this.userRepository) {
        // Importar container e obter o userRepository
        const { getContainer } = await import('../di/ContainerConfig');
        const { TOKENS } = await import('../di/Container');
        const container = getContainer();
        this.userRepository = container.get(TOKENS.USER_REPOSITORY);
      }

      // Verificar se o método findByEmailWithBusiness existe
      if (this.userRepository && typeof this.userRepository.findByEmailWithBusiness === 'function') {
        const result = await this.userRepository.findByEmailWithBusiness(email);
        
        if (result && result.business) {
          return {
            hasCompany: true,
            companyId: result.business.id,
            companyName: result.business.name
          };
        }
      } else {
        // Fallback: usar consulta através dos repositórios existentes
        console.warn('⚠️ Método findByEmailWithBusiness não encontrado, usando fallback');
        
        // Importar diretamente do database provider  
        const infrastructureModule = await import('@kaora/infrastructure');
        const prisma = infrastructureModule.DatabaseProvider.getInstance();
        
        const userWithBusiness = await prisma.user.findFirst({
          where: { email },
          include: { business: true }
        });

        if (userWithBusiness && userWithBusiness.business) {
          return {
            hasCompany: true,
            companyId: userWithBusiness.business.id,
            companyName: userWithBusiness.business.name
          };
        }
      }

      return {
        hasCompany: false,
        companyId: null,
        companyName: null
      };
    } catch (error: any) {
      console.error('❌ Erro ao verificar empresa do usuário:', error);
      throw new Error(error.message || 'Erro ao verificar empresa do usuário');
    }
  }
}
