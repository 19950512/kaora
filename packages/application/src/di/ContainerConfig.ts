import { DIContainer, TOKENS } from './Container';

// Lazy imports para evitar problemas de dependência circular
export function createContainer(useMockDatabase = false): DIContainer {
  const container = new DIContainer();

  // 🗄️ Database Provider (Singleton) - Sempre usar PostgreSQL real
  container.register(TOKENS.PRISMA_CLIENT, () => {
    // Dynamic import para Prisma real
    const { DatabaseProvider } = require('@kaora/infrastructure');
    return DatabaseProvider.getInstance();
  }, true); // Singleton

  // 🏪 Repositories
  container.register(TOKENS.BUSINESS_REPOSITORY, () => {
    const { PrismaBusinessRepository } = require('@kaora/infrastructure');
    const prisma = container.get(TOKENS.PRISMA_CLIENT);
    return new PrismaBusinessRepository(prisma);
  });

  container.register(TOKENS.USER_REPOSITORY, () => {
    const { PrismaUserRepository } = require('@kaora/infrastructure');
    const prisma = container.get(TOKENS.PRISMA_CLIENT);
    return new PrismaUserRepository(prisma);
  });

  container.register(TOKENS.AUDIT_REPOSITORY, () => {
    const { PrismaAuditLogRepository } = require('@kaora/infrastructure');
    const prisma = container.get(TOKENS.PRISMA_CLIENT);
    return new PrismaAuditLogRepository(prisma);
  });

  // 🎯 Use Cases
  container.register(TOKENS.CREATE_BUSINESS, () => {
    const { CreateBusiness } = require('@kaora/domain');
    const businessRepository = container.get(TOKENS.BUSINESS_REPOSITORY);
    const userRepository = container.get(TOKENS.USER_REPOSITORY);
    const auditRepository = container.get(TOKENS.AUDIT_REPOSITORY);
    
    return new CreateBusiness(businessRepository, userRepository, auditRepository);
  });

  // 🏢 Application Services
  container.register(TOKENS.BUSINESS_APP_SERVICE, () => {
    const { BusinessApplicationService } = require('@kaora/application');
    const createBusinessUseCase = container.get(TOKENS.CREATE_BUSINESS);
    
    return new BusinessApplicationService(createBusinessUseCase);
  });

  // 🔐 Authentication Service
  container.register(TOKENS.AUTH_SERVICE, () => {
    const { AuthenticationService } = require('@kaora/application');
    const userRepository = container.get(TOKENS.USER_REPOSITORY);
    
    return new AuthenticationService(userRepository);
  });

  return container;
}

// Container global (Singleton para a aplicação)
let globalContainer: DIContainer | null = null;

export function getContainer(): DIContainer {
  if (!globalContainer) {
    globalContainer = createContainer();
  }
  return globalContainer;
}

export function resetContainer(): void {
  globalContainer = null;
}
