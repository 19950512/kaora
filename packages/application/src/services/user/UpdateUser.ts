import { User, UserRepository } from '@kaora/domain';

export class UpdateUser {
  constructor(private readonly userRepository: UserRepository) {}

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
