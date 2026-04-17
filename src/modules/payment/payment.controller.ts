import { Controller, Post, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { InitiatePaymentDto, PaymentWebhookDto } from './dto/payment.dto';

@ApiTags('payments')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('initiate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initiate payment for an accepted booking' })
  @ApiResponse({ status: 200, description: 'Payment initiated and URL returned' })
  async initiate(@CurrentUser('userId') userId: number, @Body() dto: InitiatePaymentDto) {
    return this.paymentService.initiate(userId, dto);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mock payment gateway webhook callback' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async webhook(@Body() dto: PaymentWebhookDto) {
    return this.paymentService.handleWebhook(dto);
  }

  @Post('release/:bookingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Release funds to owner after trip completion' })
  @ApiResponse({ status: 200, description: 'Payment released successfully' })
  async release(@Param('bookingId') bookingId: number, @CurrentUser('userId') userId: number) {
    return this.paymentService.release(bookingId, userId);
  }
}
