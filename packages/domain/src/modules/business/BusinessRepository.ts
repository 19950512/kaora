import { Business } from './Business';

export interface BusinessRepository {
  existsByEmail(email: string): Promise<boolean>;
  existsByDocument(document: string): Promise<boolean>;
  save(business: Business): Promise<void>;
  saveWithUser(business: Business, user: any): Promise<void>;
  findById(id: string): Promise<Business | null>;
  update(business: Business): Promise<void>;
}
