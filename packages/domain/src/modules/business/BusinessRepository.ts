import { Business } from './Business';

export interface BusinessRepository {
  existsByEmail(email: string): Promise<boolean>;
  save(business: Business): Promise<void>;
  findById(id: string): Promise<Business | null>;
  update(business: Business): Promise<void>;
}
