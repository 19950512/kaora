import { Business } from './Business';
import { User } from '../user/User';
import { UUID } from '../../shared/ValueObject/UUID';
import { BusinessRepository } from './BusinessRepository';
import { UserRepository } from '../user/UserRepository';
import { AuditLog } from '../../shared/audit/AuditLog';
import { AuditLogRepository } from '../../shared/audit/AuditLogRepository';
import { ContextEnum } from '../../shared/audit/ContextEnum';
import { PasswordHash } from '../../shared/ValueObject/PasswordHash';

export class CreateBusiness {

  constructor(
    private businessRepository: BusinessRepository,
    private userRepository: UserRepository,
    private auditLogRepository: AuditLogRepository
  ) {}

  async execute(params: {
    businessName: string;
    responsibleName: string;
    responsibleEmail: string;
    responsiblePassword: string;
    businessDocument?: string;
    responsibleDocument: string;
    businessPhone?: string;
    responsiblePhone?: string;
  }): Promise<{ business: Business; user: User }> {
    if (await this.businessRepository.existsByEmail(params.responsibleEmail)) {
      throw new Error('Já existe uma empresa cadastrada com este e-mail.');
    }

    // Cria a empresa
    const businessId = new UUID().toString();
    const business = new Business({
      id: businessId,
      name: params.businessName,
      email: params.responsibleEmail,
      document: params.businessDocument || params.responsibleDocument, // Use businessDocument se fornecido, senão use responsibleDocument
      phone: params.businessPhone || '11999999999', // telefone padrão se não fornecido
      whatsapp: params.businessPhone || '11999999999', // usar mesmo telefone para whatsapp por padrão
      createdAt: new Date().toISOString(),
      updatedAt: undefined,
    });
    await this.businessRepository.save(business);

    // Validação: não pode haver dois usuários com o mesmo e-mail na mesma empresa
    if (await this.userRepository.existsByEmailAndBusinessId(params.responsibleEmail, businessId)) {
      throw new Error('Já existe um usuário com este e-mail nesta empresa.');
    }

    // Gera o hash da senha usando o ValueObject
    const passwordHash = await PasswordHash.create(params.responsiblePassword);

    // Cria o usuário responsável
    const userId = new UUID().toString();
    const user = new User({
      id: userId,
      businessId: businessId,
      name: params.responsibleName,
      email: params.responsibleEmail,
      passwordHash: passwordHash.toString(),
      document: params.responsibleDocument,
      phone: params.responsiblePhone || '11999999999', // telefone padrão se não fornecido
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: undefined,
    });
    await this.userRepository.save(user);

    // Auditoria: registra evento de criação de empresa
    await this.auditLogRepository.save(new AuditLog({
      context: ContextEnum.BUSINESS_CREATE,
      userId: userId,
      details: `Empresa criada: ${params.businessName} por ${params.responsibleEmail}`,
    }));

    // Auditoria: registra o evento de criação do usuário
    await this.auditLogRepository.save(new AuditLog({
      context: ContextEnum.USER_CREATE,
      userId: userId,
      details: `Usuário criado: ${params.responsibleName} cadastrado ao sistema no momento da criação da empresa ${params.businessName}`,
    }));

    return { business, user };
  }
}
