export class Phone {
  private readonly value: string;

  constructor(value: string) {
    if (!Phone.isValid(value)) {
      throw new Error('Telefone inválido');
    }
    this.value = value; // Store the phone value
  }

  static isValid(value: string): boolean {
    // Aceita formatos nacionais e internacionais, com ou sem DDD
    return /^(\+\d{1,3})?\s?\d{10,13}$/.test(value.replace(/\D/g, ''));
  }

  toString(): string {
    return this.value;
  }

  toJSON(): string {
    return this.value;
  }
}
