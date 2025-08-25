import { Contract } from './Contract';

export class CreateContract {
  async execute(userId: string, accountId: string, description: string): Promise<Contract> {
    // Validação e persistência
    return new Contract(Date.now().toString(), userId, accountId, description);
  }
}
