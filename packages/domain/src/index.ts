// Domain exports
export { CreateBusiness } from './modules/business/CreateBusiness';
export { BusinessRepositoryImplementation, setPrismaClient as setBusinessPrismaClient } from './modules/business/BusinessRepositoryImplementation';
export { UserRepositoryImplementation, setPrismaClient as setUserPrismaClient } from './modules/user/UserRepositoryImplementation';
export { AuditLogRepositoryImplementation, setPrismaClient as setAuditPrismaClient } from './shared/audit/AuditLogRepositoryImplementation';
export { SmtpEmail } from './infra/email/SmtpEmail';

// Value Objects
export { UUID } from './shared/ValueObject/UUID';
export { Email } from './shared/ValueObject/Email';
export { Document } from './shared/ValueObject/Document';
export { CPF } from './shared/ValueObject/CPF';
export { CNPJ } from './shared/ValueObject/CNPJ';
export { FullName } from './shared/ValueObject/FullName';
export { Phone } from './shared/ValueObject/Phone';
export { Whatsapp } from './shared/ValueObject/Whatsapp';
export { PasswordHash } from './shared/ValueObject/PasswordHash';
export { Data } from './shared/ValueObject/Data';
export { Age } from './shared/ValueObject/Age';

// Entities
export { Business } from './modules/business/Business';
export { User } from './modules/user/User';
export { AuditLog } from './shared/audit/AuditLog';

// Repositories (interfaces)
export { BusinessRepository } from './modules/business/BusinessRepository';
export { UserRepository } from './modules/user/UserRepository';
export { AuditLogRepository } from './shared/audit/AuditLogRepository';

// Core interfaces
export { Email as IEmail } from './core/interfaces/email/Email';
export { Cache } from './core/interfaces/cache/Cache';
export { Store } from './core/interfaces/store/Store';

// Configuration
export { ENV } from './config/env';

// Enums
export { ContextEnum } from './shared/audit/ContextEnum';
