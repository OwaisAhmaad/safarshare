import { IsNumber, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InitiatePaymentDto {
  @ApiProperty()
  @IsNumber()
  booking_id: number;
}

export class PaymentWebhookDto {
  @ApiProperty()
  @IsString()
  gateway_txn_id: string;

  @ApiProperty()
  @IsString()
  status: string;

  @ApiProperty()
  @IsNumber()
  booking_id: number;
}
