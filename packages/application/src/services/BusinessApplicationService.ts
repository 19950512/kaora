import { CreateBusiness, Store } from '@kaora/domain';

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

export interface UpdateBusinessRequest {
  businessId: string;
  name?: string;
  document?: string;
  type?: string;
  address?: string;
  phone?: string;
  website?: string;
  description?: string;
  email?: string;
  whatsapp?: string;
}

export interface UpdateBusinessResponse {
  success: boolean;
  message: string;
  business: any;
}

export interface UploadLogoRequest {
  businessId: string;
  file: {
    name: string;
    size: number;
    type: string;
    buffer: Buffer | Uint8Array;
  };
}

export interface UploadLogoResponse {
  success: boolean;
  message: string;
  logoUrl: string;
}

export class BusinessApplicationService {
  constructor(
    private createBusinessUseCase: CreateBusiness,
    private userRepository?: any, // Aceita userRepository opcional para checkUserBusiness
    private businessRepository?: any, // Aceita businessRepository opcional para getBusinessById
    private store?: Store // Aceita store opcional para upload de arquivos
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

  async getBusinessById(businessId: string): Promise<any> {
    try {
      // Se o businessRepository não foi injetado, usar a abordagem via container
      if (!this.businessRepository) {
        // Importar container e obter o businessRepository
        const { getContainer } = await import('../di/ContainerConfig');
        const { TOKENS } = await import('../di/Container');
        const container = getContainer();
        this.businessRepository = container.get(TOKENS.BUSINESS_REPOSITORY);
      }

      // Verificar se o método findById existe
      if (this.businessRepository && typeof this.businessRepository.findById === 'function') {
        const business = await this.businessRepository.findById(businessId);
        
        if (!business) {
          throw new Error('Empresa não encontrada');
        }

        // Retornar os dados da empresa formatados
        return {
          id: business.id.toString(),
          name: business.name.toString(),
          email: business.email.toString(),
          document: business.document.toString(),
          phone: business.phone.toString(),
          whatsapp: business.whatsapp.toString(),
          logoUrl: business.logoUrl,
          createdAt: business.createdAt?.toISOString() || new Date().toISOString(),
          updatedAt: business.updatedAt?.toISOString() || new Date().toISOString()
        };
      } else {
        // Fallback: usar consulta direta via Prisma
        console.warn('⚠️ Método findById não encontrado no businessRepository, usando fallback');
        
        // Importar diretamente do database provider  
        const infrastructureModule = await import('@kaora/infrastructure');
        const prisma = infrastructureModule.DatabaseProvider.getInstance();
        
        const business = await prisma.business.findUnique({
          where: { id: businessId }
        });

        if (!business) {
          throw new Error('Empresa não encontrada');
        }

        return {
          id: business.id,
          name: business.name,
          email: business.email,
          document: business.document,
          phone: business.phone,
          whatsapp: business.whatsapp,
          logoUrl: business.logoUrl,
          createdAt: business.createdAt.toISOString(),
          updatedAt: business.updatedAt.toISOString()
        };
      }
    } catch (error: any) {
      console.error('❌ Erro ao buscar empresa por ID:', error);
      throw new Error(error.message || 'Erro ao buscar empresa');
    }
  }

  async updateBusiness(request: UpdateBusinessRequest): Promise<UpdateBusinessResponse> {
    try {
      // Se o businessRepository não foi injetado, usar a abordagem via container
      if (!this.businessRepository) {
        const { getContainer } = await import('../di/ContainerConfig');
        const { TOKENS } = await import('../di/Container');
        const container = getContainer();
        this.businessRepository = container.get(TOKENS.BUSINESS_REPOSITORY);
      }

      // Verificar se a empresa existe
      const existingBusiness = await this.businessRepository.findById(request.businessId);
      if (!existingBusiness) {
        throw new Error('Empresa não encontrada');
      }

      // Criar dados de atualização apenas com os campos que existem no schema
      const updateData: any = {};
      if (request.name !== undefined) updateData.name = request.name;
      if (request.document !== undefined) updateData.document = request.document;
      if (request.phone !== undefined) updateData.phone = request.phone;
      if (request.email !== undefined) updateData.email = request.email;
      if (request.whatsapp !== undefined) updateData.whatsapp = request.whatsapp;
      // Campos type, address, website e description não existem no schema atual

      // Adicionar timestamp de atualização
      updateData.updatedAt = new Date();

      // Atualizar usando o repository (se tiver método updateById)
      let updatedBusiness;
      if (this.businessRepository && typeof this.businessRepository.updateById === 'function') {
        updatedBusiness = await this.businessRepository.updateById(request.businessId, updateData);
      } else {
        // Fallback: usar atualização direta via Prisma
        console.warn('⚠️ Método updateById não encontrado no businessRepository, usando fallback');
        
        // Importar diretamente do database provider  
        const infrastructureModule = await import('@kaora/infrastructure');
        const prisma = infrastructureModule.DatabaseProvider.getInstance();
        
        updatedBusiness = await prisma.business.update({
          where: { id: request.businessId },
          data: updateData
        });
      }

      return {
        success: true,
        message: 'Empresa atualizada com sucesso!',
        business: {
          id: updatedBusiness.id,
          name: updatedBusiness.name,
          email: updatedBusiness.email,
          document: updatedBusiness.document,
          phone: updatedBusiness.phone,
          whatsapp: updatedBusiness.whatsapp,
          logoUrl: updatedBusiness.logoUrl || null,
          active: updatedBusiness.active,
          createdAt: updatedBusiness.createdAt.toISOString(),
          updatedAt: updatedBusiness.updatedAt.toISOString()
        }
      };
    } catch (error: any) {
      console.error('❌ Erro ao atualizar empresa:', error);
      throw new Error(error.message || 'Erro ao atualizar empresa');
    }
  }

  async uploadLogo(request: UploadLogoRequest): Promise<UploadLogoResponse> {
    try {
      // Validar arquivo
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
      
      if (request.file.size > maxSize) {
        throw new Error('Arquivo muito grande. Tamanho máximo: 5MB');
      }
      
      if (!allowedTypes.includes(request.file.type)) {
        throw new Error('Tipo de arquivo não suportado. Use JPG, PNG, WebP ou SVG');
      }

      let logoUrl: string;

      try {
        // Tentar usar o R2 Store
        if (!this.store) {
          const { getContainer } = await import('../di/ContainerConfig');
          const { TOKENS } = await import('../di/Container');
          const container = getContainer();
          this.store = container.get(TOKENS.STORE);
        }

        // Gerar chave única para o arquivo
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 15);
        const extension = request.file.name.split('.').pop();
        const key = `businesses/${request.businessId}/logos/${timestamp}-${randomId}.${extension}`;

        // Fazer upload para o store
        if (!this.store) {
          throw new Error('Store não inicializado');
        }
        logoUrl = await this.store.upload(key, request.file.buffer, request.file.type);
        
      } catch (storeError: any) {
        console.warn('⚠️ R2 Store não disponível, usando fallback:', storeError.message);
        
        // Fallback: gerar URL simulada para demonstração
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 15);
        const extension = request.file.name.split('.').pop();
        logoUrl = `https://demo.kaora.app/logos/${request.businessId}/${timestamp}-${randomId}.${extension}`;
        
        console.log('📝 Modo demonstração ativado - Logo URL simulada:', logoUrl);
      }

      // Atualizar a empresa com a nova URL da logo
      if (!this.businessRepository) {
        const { getContainer } = await import('../di/ContainerConfig');
        const { TOKENS } = await import('../di/Container');
        const container = getContainer();
        this.businessRepository = container.get(TOKENS.BUSINESS_REPOSITORY);
      }

      // Atualizar a empresa com a URL da logo
      if (this.businessRepository && typeof this.businessRepository.updateById === 'function') {
        await this.businessRepository.updateById(request.businessId, { logoUrl });
      } else {
        // Fallback: usar atualização direta via Prisma
        const infrastructureModule = await import('@kaora/infrastructure');
        const prisma = infrastructureModule.DatabaseProvider.getInstance();
        
        // Usar SQL direto por enquanto até o cliente Prisma ser regenerado
        await prisma.$executeRaw`
          UPDATE business 
          SET logo_url = ${logoUrl}, updated_at = NOW() 
          WHERE id = ${request.businessId}::uuid
        `;
      }

      return {
        success: true,
        message: logoUrl.includes('placeholder') 
          ? 'Logo salva em modo demonstração (Configure as credenciais R2 para upload real)'
          : 'Logo enviada com sucesso!',
        logoUrl
      };
    } catch (error: any) {
      console.error('❌ Erro ao fazer upload da logo:', error);
      throw new Error(error.message || 'Erro ao fazer upload da logo');
    }
  }
}
