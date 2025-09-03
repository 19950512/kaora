import { UserRepository } from '@kaora/domain';

export class DeleteUser {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found.');
    }
    await this.userRepository.delete(id);
  }
}
