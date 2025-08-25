// ValueObject Data
export class Data {
  public value: Date;

  constructor(value: string | Date | undefined) {
    let date: Date;
    if (!value) {
      date = new Date();
    } else if (typeof value === 'string') {
      date = new Date(value);
    } else {
      date = value;
    }
    // Se a data for inválida, usa a data atual
    if (isNaN(date.getTime())) {
      date = new Date();
    }
    this.value = date;
  }

  toISOString(): string {
    return this.value.toISOString();
  }
}
