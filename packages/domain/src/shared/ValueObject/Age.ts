export class Age {
  private readonly value: number;

  constructor(value: number) {
    if (!Age.isValid(value)) {
      throw new Error('Idade inválida');
    }
    this.value = value;
  }

  static isValid(value: number): boolean {
    return Number.isInteger(value) && value >= 0 && value <= 120;
  }

  toNumber(): number {
    return this.value;
  }
}
