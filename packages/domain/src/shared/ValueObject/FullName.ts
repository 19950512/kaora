export class FullName {
  private readonly value: string;

  constructor(value: string) {
    if (!FullName.isValid(value)) {
      throw new Error('Nome completo inválido');
    }
    this.value = value.trim();
  }

  static isValid(value: string): boolean {
    return value.trim().split(' ').length >= 2 && value.trim().length >= 5;
  }

  toString(): string {
    return this.value;
  }

  toJSON(): string {
    return this.value;
  }
}
