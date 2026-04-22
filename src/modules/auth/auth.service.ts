import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import Redis from 'ioredis';
import { RegisterDto, VerifyOtpDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private redis: Redis;

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
    });
  }

  async register(registerDto: RegisterDto) {
    const { phone } = registerDto;
    
    // Rate limiting check
    const rateLimitKey = `otp_limit:${phone}`;
    const attempts = await this.redis.get(rateLimitKey);
    if (attempts && parseInt(attempts) >= 3) {
      throw new BadRequestException('Too many OTP attempts. Please try again later.');
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store in Redis with 5 min expiry
    await this.redis.set(`otp:${phone}`, otp, 'EX', 300);
    
    // Increment rate limit
    await this.redis.incr(rateLimitKey);
    await this.redis.expire(rateLimitKey, 3600); // 1 hour limit

    // Mock Twilio Send
    console.log(`[MOCK TWILIO] Sending OTP ${otp} to ${phone}`);
    
    return { message: 'OTP sent successfully', phone };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const { phone, otp } = verifyOtpDto;
    
    const storedOtp = await this.redis.get(`otp:${phone}`);
    
    if (!storedOtp || storedOtp !== otp) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // Clear OTP after verification
    await this.redis.del(`otp:${phone}`);
    await this.redis.del(`otp_limit:${phone}`);

    // Find or create user
    let user = await this.userService.findByPhone(phone);
    if (!user) {
      user = await this.userService.create({ phone });
    }

    const payload = { phone: user.phone, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async resendOtp(phone: string) {
    return this.register({ phone });
  }
}
