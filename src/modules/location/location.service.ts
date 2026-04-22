import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { redisConfig } from '../../../redis.config';

@Injectable()
export class LocationService implements OnModuleInit, OnModuleDestroy {
  private redis: Redis;

  onModuleInit() {
    this.redis = new Redis(redisConfig);
  }

  onModuleDestroy() {
    this.redis.disconnect();
  }

  /**
   * Saves current location in Redis
   * Key pattern: trip:location:{bookingId}
   */
  async saveLocation(bookingId: number, lat: number, lng: number) {
    const key = `trip:location:${bookingId}`;
    const value = JSON.stringify({ lat, lng, timestamp: new Date() });
    
    // Set with 4 hour expiry as requested (trip duration + buffer)
    await this.redis.set(key, value, 'EX', 3600 * 4);
  }

  /**
   * Retrieves last known location
   */
  async getLocation(bookingId: number) {
    const key = `trip:location:${bookingId}`;
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Cleans up location data
   */
  async clearLocation(bookingId: number) {
    const key = `trip:location:${bookingId}`;
    await this.redis.del(key);
  }
}
