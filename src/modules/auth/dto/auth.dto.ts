import { IsPhoneNumber, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: '+923001234567' })
  @IsPhoneNumber()
  phone: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: '+923001234567' })
  @IsPhoneNumber()
  phone: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 6)
  otp: string;
}
