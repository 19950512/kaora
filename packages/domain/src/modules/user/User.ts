import { UUID } from '../../shared/ValueObject/UUID';
import { FullName } from '../../shared/ValueObject/FullName';
import { Email } from '../../shared/ValueObject/Email';
import { Document } from '../../shared/ValueObject/Document';
import { Phone } from '../../shared/ValueObject/Phone';
import { Data } from '../../shared/ValueObject/Data';

export class User {
  public readonly id: UUID;
  public businessId: UUID;
  public name: FullName;
  public email: Email;
  public passwordHash: string;
  public document: Document;
  public phone: Phone;
  public active: boolean;
  public createdAt: Data;
  public updatedAt: Data;

  constructor(params: {
    id: string;
    businessId: string;
    name: string;
    email: string;
    passwordHash: string;
    document: string;
    phone: string;
    active?: boolean;
    createdAt?: string | Date;
    updatedAt?: string | Date;
  }) {
    this.id = new UUID(params.id);
    this.businessId = new UUID(params.businessId);
    this.name = new FullName(params.name);
    this.email = new Email(params.email);
    this.passwordHash = params.passwordHash;
    this.document = new Document(params.document);
    this.phone = new Phone(params.phone);
    this.active = params.active ?? true;
    this.createdAt = new Data(params.createdAt);
    this.updatedAt = new Data(params.updatedAt);
  }
}
