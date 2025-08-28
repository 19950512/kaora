export class Name {
  private readonly value: string;

  constructor(value: string) {
    if (!Name.isValid(value)) {
      throw new Error('Nome inválido');
    }
    this.value = value.trim();
  }

  static isValid(value: string): boolean {
    return value.trim().split(' ').length >= 1 && value.trim().length >= 4;
  }

  toString(): string {
    return this.value;
  }
}
