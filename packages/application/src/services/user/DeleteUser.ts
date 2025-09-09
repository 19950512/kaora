import { UserRepository, AuditLog, AuditLogRepository, ContextEnum } from '@kaora/domain';

export class DeleteUser {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly auditLogRepository: AuditLogRepository
  ) {}

  async execute(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found.');
    }

    // Auditoria: registra evento de exclusão de usuário antes de deletar
    await this.auditLogRepository.save(new AuditLog({
      context: ContextEnum.USER_DELETE,
      userId: id,
      businessId: user.businessId.toString(),
      details: `Usuário excluído: ${user.name.toString()} (${user.email.toString()})`,
    }));

    await this.userRepository.delete(id);
  }
}
