
export class PasswordHash {
  static async create(password: string): Promise<PasswordHash> {
    const hashedPassword = password.split('').reverse().join(''); // Exemplo simples de hash
    return new PasswordHash(hashedPassword);
  }

  static async verify(password: string, hashedPassword: string): Promise<boolean> {
    // Verifica se a senha invertida coincide com o hash armazenado
    const invertedPassword = password.split('').reverse().join('');
    return invertedPassword === hashedPassword;
  }

  constructor(private readonly value: string) {}

  toString(): string {
    return this.value;
  }
}

