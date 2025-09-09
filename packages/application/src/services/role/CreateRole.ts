import { Role, RoleRepository, UUID, AuditLog, AuditLogRepository, ContextEnum } from '@kaora/domain';

export class CreateRole {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly auditLogRepository: AuditLogRepository
  ) {}

  async execute(input: CreateRole.Input, auditContext: CreateRole.AuditContext): Promise<void> {
    // Verificar se já existe um role com esse nome no business
    const existsRole = await this.roleRepository.existsByNameAndBusinessId(input.name, auditContext.businessId);
    if (existsRole) {
      throw new Error('Role with this name already exists in this business.');
    }

    const roleId = new UUID().toString();
    const role = new Role({
      id: roleId,
      businessId: auditContext.businessId,
      name: input.name,
      active: input.active,
      color: input.color,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await this.roleRepository.save(role);

    // Auditoria detalhada com contexto real
    await this.auditLogRepository.save(new AuditLog({
      context: ContextEnum.ROLE_CREATE,
      userId: auditContext.userId,
      businessId: auditContext.businessId,
      details: `Role criado: "${input.name}" (ID: ${roleId}) - Ativo: ${input.active ? 'Sim' : 'Não'}, Cor: ${input.color}`,
      ipAddress: auditContext.ipAddress,
      userAgent: auditContext.userAgent,
      additionalData: {
        roleId: roleId,
        name: input.name,
        active: input.active,
        color: input.color,
        operation: 'CREATE'
      }
    }));
  }
}

export namespace CreateRole {
  export interface Input {
    name: string;
    active: boolean;
    color: string;
  }

  export interface AuditContext {
    userId: string;
    businessId: string;
    ipAddress?: string;
    userAgent?: string;
  }
}
