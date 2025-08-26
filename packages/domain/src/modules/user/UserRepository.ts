import { User } from './User';

export interface UserRepository {
    save(user: User): Promise<void>;
    existsByEmailAndBusinessId(email: string, businessId: string): Promise<boolean>;
    findById(id: string): Promise<User | null>;
    findByEmailWithBusiness?(email: string): Promise<{ user: User; business: any } | null>;
}