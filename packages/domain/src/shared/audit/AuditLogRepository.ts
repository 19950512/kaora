import { AuditLog } from './AuditLog';

export interface AuditLogRepository {
  save(audit: AuditLog): Promise<void>;
}
