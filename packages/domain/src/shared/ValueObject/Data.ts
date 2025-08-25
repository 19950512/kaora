// ValueObject Data
export class Data {
  public value: Date;

  constructor(value: string | Date | undefined) {
    if (!value) {
      this.value = new Date();
    } else if (typeof value === 'string') {
      this.value = new Date(value);
    } else {
      this.value = value;
    }
  }

  toISOString(): string {
    return this.value.toISOString();
  }
}
