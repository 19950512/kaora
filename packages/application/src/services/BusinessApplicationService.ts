import { CreateBusiness } from '@kaora/domain';

export interface CreateBusinessRequest {
  businessName: string;
  responsibleName: string;
  responsibleEmail: string;
  responsiblePassword: string;
  responsibleDocument: string;
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

export class BusinessApplicationService {
  constructor(
    private createBusinessUseCase: CreateBusiness
  ) {}

  async createBusiness(request: CreateBusinessRequest): Promise<CreateBusinessResponse> {
    try {
      const result = await this.createBusinessUseCase.execute({
        businessName: request.businessName,
        responsibleName: request.responsibleName,
        responsibleEmail: request.responsibleEmail,
        responsiblePassword: request.responsiblePassword,
        businessDocument: request.responsibleDocument,
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
}
