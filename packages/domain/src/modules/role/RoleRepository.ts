import { Role } from './Role';

export interface RoleRepository {
    save(role: Role): Promise<void>;
    update(role: Role): Promise<void>;
    delete(id: string, businessId: string): Promise<void>;
    findById(id: string, businessId: string): Promise<Role | null>;
    findAllByBusinessId(businessId: string): Promise<Role[]>;
    existsByNameAndBusinessId(name: string, businessId: string, excludeId?: string): Promise<boolean>;
}
