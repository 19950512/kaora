import { CPF } from './CPF';
import { CNPJ } from './CNPJ';

export class Document {
  private readonly value: string;
  private readonly type: 'CPF' | 'CNPJ';

  constructor(value: string) {
    const clean = value.replace(/\D/g, '');
    if (clean.length === 11 && CPF.isValid(clean)) {
      this.type = 'CPF';
      this.value = clean;
    } else if (clean.length === 14 && CNPJ.isValid(clean)) {
      this.type = 'CNPJ';
      this.value = clean;
    } else {
      throw new Error('Documento inválido');
    }
  }

  isCPF(): boolean {
    return this.type === 'CPF';
  }

  isCNPJ(): boolean {
    return this.type === 'CNPJ';
  }

  toString(): string {
    return this.value;
  }
}
