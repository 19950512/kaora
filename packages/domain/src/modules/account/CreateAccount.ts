import { Account } from './Account';
import { UUID } from '../../shared/ValueObject/UUID';
import { FullName } from '../../shared/ValueObject/FullName';
import { Email } from '../../shared/ValueObject/Email';
import { Document } from '../../shared/ValueObject/Document';
import { Phone } from '../../shared/ValueObject/Phone';

export class CreateAccount {
  async execute(userId: string, bank: string, number: string): Promise<Account> {
    // Validação e persistência
    return new Account({
      userId: new UUID(userId),
      businessId: new UUID(), // ajuste conforme lógica real
      holder: '', // ajuste conforme lógica real
      email: '', // ajuste conforme lógica real
      passwordHash: '', // ajuste conforme lógica real
      document: '', // ajuste conforme lógica real
      phone: '', // ajuste conforme lógica real
      bank,
      number,
    });
  }
}
