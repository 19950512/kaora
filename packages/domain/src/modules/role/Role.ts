import { UUID } from '../../shared/ValueObject/UUID';
import { Name } from '../../shared/ValueObject/Name';
import { Data } from '../../shared/ValueObject/Data';

export class Role {
  public readonly id: UUID;
  public businessId: UUID;
  public name: Name;
  public active: boolean;
  public color: string;
  public createdAt: Data;
  public updatedAt: Data;

  constructor(params: {
    id?: string;
    businessId: string;
    name: string;
    active?: boolean;
    color: string;
    createdAt?: string | Date;
    updatedAt?: string | Date;
  }) {
    this.id = new UUID(params.id);
    this.businessId = new UUID(params.businessId);
    this.name = new Name(params.name);
    this.active = params.active ?? true;
    this.color = params.color;
    this.createdAt = new Data(params.createdAt);
    this.updatedAt = new Data(params.updatedAt);
  }

  toObject() {
    return {
      id: this.id.toString(),
      businessId: this.businessId.toString(),
      name: this.name.toString(),
      active: this.active,
      color: this.color,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
