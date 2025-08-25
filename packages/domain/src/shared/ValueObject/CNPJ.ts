export class CNPJ {
  private readonly value: string;

  constructor(value: string) {
    if (!CNPJ.isValid(value)) {
      throw new Error('CNPJ inválido');
    }
    this.value = value.replace(/\D/g, '');
  }

  static isValid(value: string): boolean {
    const cnpj = value.replace(/\D/g, '');
    if (cnpj.length !== 14 || /^([0-9])\1+$/.test(cnpj)) return false;
    let length = cnpj.length - 2;
    let numbers = cnpj.substring(0, length);
    let digits = cnpj.substring(length);
    let sum = 0;
    let pos = length - 7;
    for (let i = length; i >= 1; i--) {
      sum += Number(numbers[length - i]) * pos--;
      if (pos < 2) pos = 9;
    }
    let firstCheck = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (firstCheck !== Number(digits[0])) return false;
    sum = 0;
    length = length + 1;
    numbers = cnpj.substring(0, length);
    pos = length - 7;
    for (let i = length; i >= 1; i--) {
      sum += Number(numbers[length - i]) * pos--;
      if (pos < 2) pos = 9;
    }
    let secondCheck = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return secondCheck === Number(digits[1]);
  }

  toString(): string {
    return this.value;
  }
}
