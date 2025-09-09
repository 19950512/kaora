import { Role, RoleRepository, AuditLog, AuditLogRepository, ContextEnum } from '@kaora/domain';

export class UpdateRole {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly auditLogRepository: AuditLogRepository
  ) {}

  async execute(id: string, input: UpdateRole.Input, auditContext: UpdateRole.AuditContext): Promise<void> {
    const role = await this.roleRepository.findById(id, auditContext.businessId);
    
    if (!role) {
      throw new Error('Role não encontrado');
    }

    // Verificar se outro role com o mesmo nome já existe neste business
    const existsRole = await this.roleRepository.existsByNameAndBusinessId(input.name, auditContext.businessId, id);
    if (existsRole) {
      throw new Error('Role with this name already exists in this business.');
    }

    // Capturar valores anteriores para auditoria
    const previousValues = {
      name: role.name.toString(),
      active: role.active,
      color: role.color
    };

    const updatedRole = new Role({
      id: role.id.toString(),
      businessId: role.businessId.toString(),
      name: input.name,
      active: input.active,
      color: input.color,
      createdAt: role.createdAt.toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await this.roleRepository.update(updatedRole);

    // Identificar campos alterados
    const changedFields: string[] = [];
    if (previousValues.name !== input.name) changedFields.push('name');
    if (previousValues.active !== input.active) changedFields.push('active');
    if (previousValues.color !== input.color) changedFields.push('color');

    // Auditoria detalhada com contexto real
    await this.auditLogRepository.save(new AuditLog({
      context: ContextEnum.ROLE_UPDATE,
      userId: auditContext.userId,
      businessId: auditContext.businessId,
      details: `Role atualizado: "${input.name}" (ID: ${id}) - Campos alterados: ${changedFields.join(', ') || 'nenhum'}`,
      updatedFields: changedFields.join(','),
      ipAddress: auditContext.ipAddress,
      userAgent: auditContext.userAgent,
      additionalData: {
        roleId: id,
        previousValues,
        newValues: {
          name: input.name,
          active: input.active,
          color: input.color
        },
        changedFields,
        operation: 'UPDATE'
      }
    }));
  }
}

export namespace UpdateRole {
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
