import { UUID } from '../../shared/ValueObject/UUID';
import { FullName } from '../../shared/ValueObject/FullName';
import { Email } from '../../shared/ValueObject/Email';
import { Document } from '../../shared/ValueObject/Document';
import { Phone } from '../../shared/ValueObject/Phone';
import { Data } from '../../shared/ValueObject/Data';
import { Whatsapp } from '../../shared/ValueObject/Whatsapp';

export class Business {
  public readonly id: UUID;
  public name: FullName;
  public email: Email;
  public document: Document;
  public phone: Phone;
  public whatsapp: Whatsapp;
  public logoUrl?: string;
  public createdAt: Data;
  public updatedAt: Data;

  constructor(params: {
    id: string;
    name: string;
    email: string;
    document: string;
    phone: string;
    whatsapp: string;
    logoUrl?: string;
    createdAt?: string;
    updatedAt?: string;
  }) {
    this.id = new UUID(params.id);
    this.name = new FullName(params.name);
    this.email = new Email(params.email);
    this.document = new Document(params.document);
    this.phone = new Phone(params.phone);
    this.whatsapp = new Whatsapp(params.whatsapp);
    this.logoUrl = params.logoUrl?.toString();
    this.createdAt = new Data(params.createdAt);
    this.updatedAt = new Data(params.updatedAt);
  }

  public getChangedData(oldData: Business): Partial<Business> {
    const changedData: Partial<Business> = {};

    if (this.name !== oldData.name) {
      changedData.name = this.name;
    }
    if (this.email !== oldData.email) {
      changedData.email = this.email;
    }
    if (this.document !== oldData.document) {
      changedData.document = this.document;
    }
    if (this.phone !== oldData.phone) {
      changedData.phone = this.phone;
    }
    if (this.whatsapp !== oldData.whatsapp) {
      changedData.whatsapp = this.whatsapp;
    }
    if (this.logoUrl !== oldData.logoUrl) {
      changedData.logoUrl = this.logoUrl;
    }

    return changedData;
  }
}
