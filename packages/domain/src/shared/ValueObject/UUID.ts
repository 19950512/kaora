import { v4 as uuidv4, validate as uuidValidate } from 'uuid';

export class UUID {
  private readonly value: string;

  constructor(value?: string) {
    if (value) {
      if (!uuidValidate(value)) {
        throw new Error('UUID inválido');
      }
      this.value = value;
    } else {
      this.value = uuidv4();
    }
  }

  toString(): string {
    return this.value;
  }

  equals(other: UUID): boolean {
    return this.value === other.value;
  }
}
