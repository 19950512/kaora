// import { PrismaClient } from '@prisma/client';

export class DatabaseProvider {
  private static instance: any | null = null;

  static getInstance(): any {
    if (!DatabaseProvider.instance) {
      // TODO: Descomentar quando Prisma estiver configurado
      // DatabaseProvider.instance = new PrismaClient({
      //   log: ['query', 'info', 'warn', 'error'],
      // });
      
      // Por enquanto, usar mock
      DatabaseProvider.instance = MockDatabaseProvider.createMockPrisma();
    }
    return DatabaseProvider.instance;
  }

  static async disconnect(): Promise<void> {
    if (DatabaseProvider.instance) {
      // TODO: Descomentar quando Prisma estiver configurado
      // await DatabaseProvider.instance.$disconnect();
      DatabaseProvider.instance = null;
    }
  }
}

// Mock para desenvolvimento/testes
export class MockDatabaseProvider {
  static createMockPrisma() {
    return {
      business: {
        findUnique: async ({ where }: any) => {
          console.log('🔍 [MOCK DB] Verificando se empresa existe:', where);
          return null; // Simula que não existe
        },
        create: async (data: any) => {
          console.log('💾 [MOCK DB] Criando empresa:', data.data);
          return { id: data.data.id, ...data.data };
        },
        count: async ({ where }: any) => {
          console.log('🔢 [MOCK DB] Contando empresas:', where);
          return 0; // Simula que não existe
        }
      },
      user: {
        findFirst: async ({ where }: any) => {
          console.log('🔍 [MOCK DB] Verificando usuário:', where);
          return null; // Simula que não existe
        },
        create: async (data: any) => {
          console.log('💾 [MOCK DB] Criando usuário:', data.data);
          return { id: data.data.id, ...data.data };
        },
        count: async ({ where }: any) => {
          console.log('🔢 [MOCK DB] Contando usuários:', where);
          return 0; // Simula que não existe
        }
      },
      auditLog: {
        create: async (data: any) => {
          console.log('📝 [MOCK DB] Criando log de auditoria:', data.data);
          return { id: data.data.id, ...data.data };
        },
        findMany: async ({ where }: any) => {
          console.log('📋 [MOCK DB] Buscando logs:', where);
          return []; // Simula lista vazia
        }
      }
    };
  }
}
