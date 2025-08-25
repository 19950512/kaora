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
        timestamp: audit.timestamp.toISOString(),
        details: audit.details,
      },
    });
  }
}
