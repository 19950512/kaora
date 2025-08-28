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
    responsibleDocument: string;
    businessDocument?: string;
    businessPhone?: string;
    responsiblePhone?: string;
  }): Promise<{ business: Business; user: User }> {
    if (await this.businessRepository.existsByEmail(params.responsibleEmail)) {
      throw new Error('Já existe uma empresa cadastrada com este e-mail.');
    }
    // Validação: não pode haver duas empresas com o mesmo documento
    const documentToCheck = params.businessDocument || params.responsibleDocument;
    if (documentToCheck) {
      if (typeof this.businessRepository.existsByDocument === 'function') {
        if (await this.businessRepository.existsByDocument(documentToCheck)) {
          throw new Error('Já existe uma empresa cadastrada com este documento.');
        }
      } else {
        // Fallback: consulta manual se necessário
        // Implemente existsByDocument no BusinessRepository se não existir
      }
    }

    // Cria a empresa e o usuário juntos em transação
    const businessId = new UUID().toString();
    const business = new Business({
      id: businessId,
      name: params.businessName,
      email: params.responsibleEmail,
      document: params.businessDocument || params.responsibleDocument,
      phone: params.businessPhone || '11999999999',
      whatsapp: params.businessPhone || '11999999999',
      createdAt: new Date().toISOString(),
      updatedAt: undefined,
    });

    // Gera o hash da senha usando o ValueObject
    const passwordHash = await PasswordHash.create(params.responsiblePassword);
    const userId = new UUID().toString();
    const user = new User({
      id: userId,
      businessId: businessId,
      name: params.responsibleName,
      email: params.responsibleEmail,
      passwordHash: passwordHash.toString(),
      document: params.responsibleDocument,
      phone: params.responsiblePhone || '11999999999',
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: undefined,
    });

    // Chama método transacional
    if (typeof this.businessRepository.saveWithUser === 'function') {
      await this.businessRepository.saveWithUser(business, user);
    } else {
      // Fallback: salva separadamente se não houver método
      await this.businessRepository.save(business);
      await this.userRepository.save(user);
    }

    // Auditoria: registra evento de criação de empresa
    await this.auditLogRepository.save(new AuditLog({
      context: ContextEnum.BUSINESS_CREATE,
      userId: userId,
      businessId: businessId,
      details: `Empresa criada: ${params.businessName} por ${params.responsibleEmail}`,
    }));

    // Auditoria: registra o evento de criação do usuário
    await this.auditLogRepository.save(new AuditLog({
      context: ContextEnum.USER_CREATE,
      userId: userId,
      businessId: businessId,
      details: `Usuário criado: ${params.responsibleName} cadastrado ao sistema no momento da criação da empresa ${params.businessName}`,
    }));

    return { business, user };
  }
}
