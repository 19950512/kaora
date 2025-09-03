import { User, UserRepository, UUID } from '@kaora/domain';

export class CreateUser {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: CreateUser.Input): Promise<void> {
    const userExists = await this.userRepository.existsByEmailAndBusinessId(input.email, input.businessId);
    if (userExists) {
      throw new Error('User with this email already exists in this business.');
    }

    // Simplificando a criação de senha para este exemplo
    const passwordHash = input.password 
      ? await new Promise<string>(resolve => setTimeout(() => resolve(`hashed_${input.password}`), 100))
      : 'no-password';

    const user = new User({
      id: new UUID().toString(),
      businessId: input.businessId,
      name: input.name,
      email: input.email,
      passwordHash,
      document: input.document,
      phone: input.phone,
      active: input.active,
    });

    await this.userRepository.save(user);
  }
}

export namespace CreateUser {
  export interface Input {
    businessId: string;
    name: string;
    email: string;
    password?: string; // Senha opcional na criação
    document: string;
    phone: string;
    active: boolean;
  }
}
