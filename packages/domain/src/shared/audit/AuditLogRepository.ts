import { AuditLog } from './AuditLog';

export interface AuditLogRepository {
  save(audit: AuditLog): Promise<void>;
  findByUserId(userId: string): Promise<AuditLog[]>;
  findByBusinessId(businessId: string, filters?: {
    context?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ logs: AuditLog[]; total: number }>;
  getContexts(): Promise<string[]>;
}
