import { Billing } from './Billing';

export class EmitBilling {
  async execute(contractId: string, amount: number, dueDate: Date): Promise<Billing> {
    // Validação e persistência
    return new Billing(Date.now().toString(), contractId, amount, dueDate);
  }
}
