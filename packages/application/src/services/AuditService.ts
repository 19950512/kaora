import { AuditLogRepository, AuditLog } from '@kaora/domain';

export class AuditService {
  constructor(private auditLogRepository: AuditLogRepository) {}

  async getAuditLogs(businessId: string, filters?: {
    context?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ logs: AuditLog[]; total: number }> {
    return this.auditLogRepository.findByBusinessId(businessId, filters);
  }

  async getContexts(): Promise<string[]> {
    return this.auditLogRepository.getContexts();
  }

  async getAuditLogsByUser(userId: string): Promise<AuditLog[]> {
    return this.auditLogRepository.findByUserId(userId);
  }
}
