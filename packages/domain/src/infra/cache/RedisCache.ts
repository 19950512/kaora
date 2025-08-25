import { Cache } from '../../core/interfaces/cache/Cache';
import { createClient, RedisClientType } from 'redis';

export class RedisCache implements Cache {
  private client: RedisClientType;

  constructor(url: string) {
    this.client = createClient({ url });
    this.client.connect();
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    return value ? (JSON.parse(value) as T) : null;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const data = JSON.stringify(value);
    if (ttl) {
      await this.client.set(key, data, { EX: ttl });
    } else {
      await this.client.set(key, data);
    }
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }
}
