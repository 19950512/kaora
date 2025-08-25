export class Whatsapp {
  private readonly value: string;

  constructor(value: string) {
    if (!Whatsapp.isValid(value)) {
      throw new Error('Whatsapp inválido');
    }
    this.value = value;
  }

  static isValid(value: string): boolean {
    // Aceita apenas números válidos para WhatsApp (mesma regra do Phone)
    return /^(\+\d{1,3})?\s?\d{10,13}$/.test(value.replace(/\D/g, ''));
  }

  toString(): string {
    return this.value;
  }
}
