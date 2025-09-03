export interface Container {
  get<T>(token: string): T;
  register<T>(token: string, factory: () => T): void;
}

export class DIContainer implements Container {
  private services = new Map<string, any>();
  private singletons = new Map<string, any>();

  register<T>(token: string, factory: () => T, singleton = false): void {
    this.services.set(token, { factory, singleton });
  }

  get<T>(token: string): T {
    const service = this.services.get(token);
    if (!service) {
      throw new Error(`Service not found: ${token}`);
    }

    if (service.singleton) {
      if (!this.singletons.has(token)) {
        this.singletons.set(token, service.factory());
      }
      return this.singletons.get(token);
    }

    return service.factory();
  }

  clear(): void {
    this.services.clear();
    this.singletons.clear();
  }
}

// Tokens para DI
export const TOKENS = {
  // Infrastructure
  PRISMA_CLIENT: 'PrismaClient',
  STORE: 'Store',
  
  // Repositories
  BUSINESS_REPOSITORY: 'BusinessRepository',
  USER_REPOSITORY: 'UserRepository',
  AUDIT_REPOSITORY: 'AuditLogRepository',
  
  // Use Cases
  CREATE_BUSINESS: 'CreateBusiness',
  
  // Application Services
  BUSINESS_APP_SERVICE: 'BusinessApplicationService',
  AUDIT_SERVICE: 'AuditService',

  // ...existing code...
  // Authentication
  AUTH_SERVICE: 'AuthenticationService',
  USER_SERVICE: 'UserService',

  // User CRUD
  CREATE_USER: 'CreateUser',
  UPDATE_USER: 'UpdateUser',
  DELETE_USER: 'DeleteUser',
} as const;

