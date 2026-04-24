import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class LocationService implements OnModuleInit, OnModuleDestroy {
  private redis: Redis;

  constructor(private config: ConfigService) {}

  onModuleInit() {
    this.redis = new Redis({
      host: this.config.get<string>('REDIS_HOST', 'localhost'),
      port: this.config.get<number>('REDIS_PORT', 6379),
    });
  }

  onModuleDestroy() {
    this.redis.disconnect();
  }

  async saveLocation(bookingId: number, lat: number, lng: number) {
    const key = `trip:location:${bookingId}`;
    const value = JSON.stringify({ lat, lng, timestamp: new Date() });
    await this.redis.set(key, value, 'EX', 3600 * 4);
  }

  async getLocation(bookingId: number) {
    const key = `trip:location:${bookingId}`;
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async clearLocation(bookingId: number) {
    const key = `trip:location:${bookingId}`;
    await this.redis.del(key);
  }
}
