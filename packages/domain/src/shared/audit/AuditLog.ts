import { ContextEnum } from './ContextEnum';
import { UUID } from '../ValueObject/UUID';
import { Data } from '../ValueObject/Data';

export class AuditLog {
  public readonly id: UUID;
  public readonly context: ContextEnum;
  public readonly userId: string;
  public readonly timestamp: Data;
  public readonly details?: string;
  public readonly ipAddress?: string;
  public readonly userAgent?: string;
  public readonly businessId: string;
  public readonly additionalData?: any;
  public readonly updatedFields?: string;

  constructor(params: {
    context: ContextEnum;
    userId: string;
    businessId: string;
    details?: string;
    timestamp?: string | Date;
    ipAddress?: string;
    userAgent?: string;
    additionalData?: any;
    updatedFields?: string;
  }) {
    this.id = new UUID();
    this.context = params.context;
    this.userId = params.userId;
    this.businessId = params.businessId;
    this.details = params.details;
    this.timestamp = new Data(params.timestamp ?? new Date());
    this.ipAddress = params.ipAddress;
    this.userAgent = params.userAgent;
    this.additionalData = params.additionalData;
    this.updatedFields = params.updatedFields;
  }
}
