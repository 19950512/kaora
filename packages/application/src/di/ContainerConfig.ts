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

  // 📦 Store (R2)
  container.register(TOKENS.STORE, () => {
    const { R2Store } = require('@kaora/infrastructure');
    return new R2Store();
  }, true); // Singleton

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
    const userRepository = container.get(TOKENS.USER_REPOSITORY);
    const businessRepository = container.get(TOKENS.BUSINESS_REPOSITORY);
    const store = container.get(TOKENS.STORE);
    
    return new BusinessApplicationService(createBusinessUseCase, userRepository, businessRepository, store);
  });

  // � Audit Service
  container.register(TOKENS.AUDIT_SERVICE, () => {
    const { AuditService } = require('@kaora/application');
    const auditRepository = container.get(TOKENS.AUDIT_REPOSITORY);
    
    return new AuditService(auditRepository);
  });

  // �🔐 Authentication Service
  container.register(TOKENS.AUTH_SERVICE, () => {
    const { AuthenticationService } = require('@kaora/application');
    const userRepository = container.get(TOKENS.USER_REPOSITORY);
    
    return new AuthenticationService(userRepository);
  });

  // User Service
  container.register(TOKENS.USER_SERVICE, () => {
    const { UserService } = require('../services/UserService');
    const userRepository = container.get(TOKENS.USER_REPOSITORY);
    
    return new UserService(userRepository);
  });

  // User CRUD
  container.register(TOKENS.CREATE_USER, () => {
    const { CreateUser } = require('../services/user/CreateUser');
    const userRepository = container.get(TOKENS.USER_REPOSITORY);
    return new CreateUser(userRepository);
  });

  container.register(TOKENS.UPDATE_USER, () => {
    const { UpdateUser } = require('../services/user/UpdateUser');
    const userRepository = container.get(TOKENS.USER_REPOSITORY);
    return new UpdateUser(userRepository);
  });

  container.register(TOKENS.DELETE_USER, () => {
    const { DeleteUser } = require('../services/user/DeleteUser');
    const userRepository = container.get(TOKENS.USER_REPOSITORY);
    return new DeleteUser(userRepository);
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
