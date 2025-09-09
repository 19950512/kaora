import { RoleRepository, AuditLog, AuditLogRepository, ContextEnum } from '@kaora/domain';

export class DeleteRole {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly auditLogRepository: AuditLogRepository
  ) {}

  async execute(id: string, auditContext: DeleteRole.AuditContext): Promise<void> {
    const role = await this.roleRepository.findById(id, auditContext.businessId);
    
    if (!role) {
      throw new Error('Role não encontrado');
    }

    // Capturar dados do role antes da exclusão para auditoria
    const roleData = {
      id: role.id.toString(),
      businessId: role.businessId.toString(),
      name: role.name.toString(),
      active: role.active,
      color: role.color,
      createdAt: role.createdAt.toISOString(),
      updatedAt: role.updatedAt.toISOString()
    };

    await this.roleRepository.delete(id, auditContext.businessId);

    // Auditoria detalhada com contexto real
    await this.auditLogRepository.save(new AuditLog({
      context: ContextEnum.ROLE_DELETE,
      userId: auditContext.userId,
      businessId: auditContext.businessId,
      details: `Role deletado: "${roleData.name}" (ID: ${id}) - Ativo: ${roleData.active ? 'Sim' : 'Não'}, Cor: ${roleData.color}`,
      ipAddress: auditContext.ipAddress,
      userAgent: auditContext.userAgent,
      additionalData: {
        deletedRole: roleData,
        operation: 'DELETE'
      }
    }));
  }
}

export namespace DeleteRole {
  export interface AuditContext {
    userId: string;
    businessId: string;
    ipAddress?: string;
    userAgent?: string;
  }
}
