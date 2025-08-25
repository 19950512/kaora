
export class PasswordHash {
  static async create(password: string): Promise<PasswordHash> {
    const hashedPassword = password.split('').reverse().join(''); // Exemplo simples de hash
    return new PasswordHash(hashedPassword);
  }

  constructor(private readonly value: string) {}

  toString(): string {
    return this.value;
  }
}

