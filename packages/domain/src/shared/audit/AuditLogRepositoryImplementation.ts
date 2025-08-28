import { AuditLog } from './AuditLog';
import { AuditLogRepository } from './AuditLogRepository';

// Prisma Client será inicializado via injeção de dependência
let prisma: any = null;

// Método para injetar o Prisma Client
export function setPrismaClient(client: any) {
  prisma = client;
}

export class AuditLogRepositoryImplementation implements AuditLogRepository {
  async save(audit: AuditLog): Promise<void> {
    if (!prisma) throw new Error('PrismaClient não está disponível.');
    await prisma.auditLog.create({
      data: {
        id: audit.id.toString(),
        context: audit.context,
        userId: audit.userId,
        businessId: audit.businessId,
        timestamp: audit.timestamp.toISOString(),
        details: audit.details,
        ipAddress: audit.ipAddress,
        userAgent: audit.userAgent,
        additionalData: audit.additionalData,
        updatedFields: audit.updatedFields,
      },
    });
  }

  async findByUserId(userId: string): Promise<AuditLog[]> {
    if (!prisma) throw new Error('PrismaClient não está disponível.');
    const logs = await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' }
    });

    return logs.map((log: any) => new AuditLog({
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
  }

  async findByBusinessId(businessId: string, filters?: {
    context?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ logs: AuditLog[]; total: number }> {
    if (!prisma) throw new Error('PrismaClient não está disponível.');
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
      prisma.auditLog.findMany({
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
      prisma.auditLog.count({ where })
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
    if (!prisma) throw new Error('PrismaClient não está disponível.');
    const contexts = await prisma.auditLog.findMany({
      select: {
        context: true
      },
      distinct: ['context']
    });

    return contexts.map((c: any) => c.context);
  }
}
