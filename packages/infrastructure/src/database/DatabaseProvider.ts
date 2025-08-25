import { PrismaClient } from '../../prisma/generated/client';

export class DatabaseProvider {
  private static instance: PrismaClient | null = null;

  static getInstance(): PrismaClient {
    if (!DatabaseProvider.instance) {
      DatabaseProvider.instance = new PrismaClient({
        log: ['query', 'info', 'warn', 'error'],
        datasources: {
          db: {
            url: process.env.DATABASE_URL || "postgresql://kaora:kaora123@localhost:9069/kaora?schema=public"
          }
        }
      });
    }
    return DatabaseProvider.instance;
  }

  static async disconnect(): Promise<void> {
    if (DatabaseProvider.instance) {
      await DatabaseProvider.instance.$disconnect();
      DatabaseProvider.instance = null;
    }
  }

  static async connect(): Promise<void> {
    const prisma = DatabaseProvider.getInstance();
    try {
      await prisma.$connect();
      console.log('✅ Conectado ao PostgreSQL com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao conectar com PostgreSQL:', error);
      throw error;
    }
  }

  static async healthCheck(): Promise<boolean> {
    try {
      const prisma = DatabaseProvider.getInstance();
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('❌ Health check falhou:', error);
      return false;
    }
  }
}
