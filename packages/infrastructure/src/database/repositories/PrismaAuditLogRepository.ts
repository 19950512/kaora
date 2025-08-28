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
        businessId: auditLog.businessId.toString(),
        timestamp: auditLog.timestamp.value,
        details: auditLog.details,
        ipAddress: auditLog.ipAddress,
        userAgent: auditLog.userAgent,
        additionalData: auditLog.additionalData,
        updatedFields: auditLog.updatedFields,
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
      businessId: log.businessId,
      details: log.details,
      timestamp: log.timestamp?.toISOString(),
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      additionalData: log.additionalData,
      updatedFields: log.updatedFields,
    }));
  }

  async findByBusinessId(businessId: string, filters?: {
    context?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ logs: AuditLog[]; total: number }> {
    const where: any = { businessId };

    if (filters?.context) {
      where.context = filters.context;
    }

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    if (filters?.startDate || filters?.endDate) {
      where.timestamp = {};
      if (filters.startDate) {
        where.timestamp.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.timestamp.lte = filters.endDate;
      }
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      this.prisma.auditLog.count({ where })
    ]);

    const auditLogs = logs.map((log: any) => new AuditLog({
      context: log.context as any,
      userId: log.userId,
      businessId: log.businessId,
      details: log.details,
      timestamp: log.timestamp?.toISOString(),
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      additionalData: log.additionalData,
      updatedFields: log.updatedFields,
    }));

    return { logs: auditLogs, total };
  }

  async getContexts(): Promise<string[]> {
    try {
      const contexts = await this.prisma.auditLog.findMany({
        select: {
          context: true
        },
        distinct: ['context']
      });

      const result = contexts.map((c: any) => c.context);

      // Se não houver contextos, retorna alguns padrões
      if (result.length === 0) {
        return ['BUSINESS_CREATE', 'BUSINESS_UPDATE', 'USER_CREATE'];
      }

      return result;
    } catch (error) {
      console.error('Error fetching contexts:', error);
      // Em caso de erro, retorna contextos padrão
      return ['BUSINESS_CREATE', 'BUSINESS_UPDATE', 'USER_CREATE'];
    }
  }
}
