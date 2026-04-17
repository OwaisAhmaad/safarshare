import { RedisOptions } from 'ioredis';
import * as dotenv from 'dotenv';

dotenv.config();

export const redisConfig: RedisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  retryStrategy: (times: number) => {
    return Math.min(times * 50, 2000);
  },
};
