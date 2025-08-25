import { ContextEnum } from './ContextEnum';
import { UUID } from '../ValueObject/UUID';
import { Data } from '../ValueObject/Data';

export class AuditLog {
  public readonly id: UUID;
  public readonly context: ContextEnum;
  public readonly userId: string;
  public readonly timestamp: Data;
  public readonly details?: string;
  public readonly updatedFields?: string;

  constructor(params: {
    context: ContextEnum;
    userId: string;
    details?: string;
    timestamp?: string | Date;
    updatedFields?: string;
  }) {
    this.id = new UUID();
    this.context = params.context;
    this.userId = params.userId;
    this.details = params.details;
    this.timestamp = new Data(params.timestamp);
    this.updatedFields = params.updatedFields;
  }
}
