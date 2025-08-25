import { UUID } from '../../shared/ValueObject/UUID';
import { FullName } from '../../shared/ValueObject/FullName';
import { Email } from '../../shared/ValueObject/Email';
import { Document } from '../../shared/ValueObject/Document';
import { Phone } from '../../shared/ValueObject/Phone';
import { Data } from '../../shared/ValueObject/Data';

export class Account {
  public readonly id: UUID;
  public userId: UUID;
  public businessId: UUID;
  public holder: FullName;
  public email: Email;
  public passwordHash: string;
  public document: Document;
  public phone: Phone;
  public bank: string;
  public number: string;
  public active: boolean;
  public createdAt: Data;
  public updatedAt: Data;

  constructor(params: {
    id?: UUID;
    userId: UUID;
    businessId: UUID;
    holder: string;
    email: string;
    passwordHash: string;
    document: string;
    phone: string;
    bank: string;
    number: string;
    active?: boolean;
    createdAt?: string | Date;
    updatedAt?: string | Date;
  }) {
    this.id = params.id ?? new UUID();
    this.userId = params.userId;
    this.businessId = params.businessId;
    this.holder = new FullName(params.holder);
    this.email = new Email(params.email);
    this.passwordHash = params.passwordHash;
    this.document = new Document(params.document);
    this.phone = new Phone(params.phone);
    this.bank = params.bank;
    this.number = params.number;
    this.active = params.active ?? true;
    this.createdAt = new Data(params.createdAt);
    this.updatedAt = new Data(params.updatedAt);
  }
}
