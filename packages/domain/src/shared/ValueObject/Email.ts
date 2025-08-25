export class Email {
  private readonly value: string;

  constructor(value: string) {
    if (!Email.isValid(value)) {
      throw new Error('Email inválido');
    }
    this.value = value;
  }

  static isValid(value: string): boolean {
    return /^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/.test(value);
  }

  toString(): string {
    return this.value;
  }
}
