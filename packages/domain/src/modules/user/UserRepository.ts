import { User } from './User';

export interface UserRepository {
    save(user: User): Promise<void>;
    update(user: User): Promise<void>;
    delete(id: string): Promise<void>;
    existsByEmailAndBusinessId(email: string, businessId: string): Promise<boolean>;
    findById(id: string): Promise<User | null>;
    findByEmailWithBusiness?(email: string): Promise<{ user: User; business: any } | null>;
    findAll(): Promise<User[]>;
}