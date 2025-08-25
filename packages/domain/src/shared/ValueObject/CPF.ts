export class CPF {
  private readonly value: string;

  constructor(value: string) {
    if (!CPF.isValid(value)) {
      throw new Error('CPF inválido');
    }
    this.value = value.replace(/\D/g, '');
  }

  static isValid(value: string): boolean {
    const cpf = value.replace(/\D/g, '');
    if (cpf.length !== 11 || /^([0-9])\1+$/.test(cpf)) return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += Number(cpf[i]) * (10 - i);
    let firstCheck = (sum * 10) % 11;
    if (firstCheck === 10) firstCheck = 0;
    if (firstCheck !== Number(cpf[9])) return false;
    sum = 0;
    for (let i = 0; i < 10; i++) sum += Number(cpf[i]) * (11 - i);
    let secondCheck = (sum * 10) % 11;
    if (secondCheck === 10) secondCheck = 0;
    return secondCheck === Number(cpf[10]);
  }

  toString(): string {
    return this.value;
  }
}
