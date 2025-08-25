import { AuditLogRepository } from '@kaora/domain';
import { AuditLog } from '@kaora/domain';

export class PrismaAuditLogRepository implements AuditLogRepository {
  constructor(private prisma: any) {}

  async save(auditLog: AuditLog): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        id: auditLog.id.toString(),
        context: auditLog.context,
        userId: auditLog.userId.toString(),
        timestamp: auditLog.timestamp.value,
        details: auditLog.details,
      }
    });
  }

  async findByUserId(userId: string): Promise<AuditLog[]> {
    const logs = await this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' }
    });

    return logs.map((log: any) => new AuditLog({
      context: log.context,
      userId: log.userId,
      details: log.details,
      timestamp: log.timestamp?.toISOString(),
    }));
  }
}
