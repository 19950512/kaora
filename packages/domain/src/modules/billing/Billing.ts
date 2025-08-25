export class Billing {
  constructor(
    public readonly id: string,
    public contractId: string,
    public amount: number,
    public dueDate: Date
  ) {}
}
