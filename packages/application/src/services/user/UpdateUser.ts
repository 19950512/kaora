import { User, UserRepository, AuditLog, AuditLogRepository, ContextEnum } from '@kaora/domain';

export class UpdateUser {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly auditLogRepository: AuditLogRepository
  ) {}

  async execute(id: string, input: UpdateUser.Input): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found.');
    }

    const userProps = user.toObject();

    const updatedUser = new User({
      ...userProps,
      name: input.name,
      email: input.email,
      document: input.document,
      phone: input.phone,
      active: input.active,
    });

    await this.userRepository.update(updatedUser);

    // Auditoria: registra evento de atualização de usuário
    await this.auditLogRepository.save(new AuditLog({
      context: ContextEnum.USER_UPDATE,
      userId: id,
      businessId: user.businessId.toString(),
      details: `Usuário atualizado: ${input.name} (${input.email})`,
      additionalData: { previousData: {
          name: user.name.toString(),
          email: user.email.toString(),
          document: user.document.toString(),
          phone: user.phone.toString(),
          active: user.active,
        },
        newData: {
          name: input.name,
          email: input.email,
          document: input.document,
          phone: input.phone,
          active: input.active,
        }
      },
    }));
  }
}

export namespace UpdateUser {
  export interface Input {
    name: string;
    email: string;
    document: string;
    phone: string;
    active: boolean;
  }
}
