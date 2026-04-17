import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { InitiatePaymentDto, PaymentWebhookDto } from './dto/payment.dto';
import { Booking, BookingStatus } from '../booking/entities/booking.entity';
import { VehicleType } from '../vehicle/entities/vehicle.entity';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '../notification/entities/notification.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    private dataSource: DataSource,
    private notificationService: NotificationService,
  ) {}

  async initiate(userId: number, dto: InitiatePaymentDto) {
    const booking = await this.bookingRepository.findOne({
      where: { id: dto.booking_id },
      relations: ['trip', 'trip.vehicle'],
    });

    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.passenger_id !== userId) throw new ForbiddenException('Only the passenger can initiate payment');
    if (booking.status !== BookingStatus.ACCEPTED) throw new BadRequestException('Payment can only be initiated for accepted bookings');

    // Check if payment already exists
    const existingPayment = await this.paymentRepository.findOne({ where: { booking_id: booking.id } });
    if (existingPayment) return { payment_url: `https://mock-gateway.com/pay/${existingPayment.id}`, payment: existingPayment };

    // Calculate commission
    const vehicleType = booking.trip.vehicle_type;
    const commissionRate = (vehicleType === VehicleType.CAR || vehicleType === VehicleType.BIKE) ? 0.08 : 0.10;
    const commission = booking.total_price * commissionRate;
    const netAmount = booking.total_price - commission;

    const payment = this.paymentRepository.create({
      booking_id: booking.id,
      amount: booking.total_price,
      commission,
      net_amount: netAmount,
      status: PaymentStatus.HELD,
    });

    const savedPayment = await this.paymentRepository.save(payment);

    return {
      payment_url: `https://mock-gateway.com/pay/${savedPayment.id}`,
      payment: savedPayment,
    };
  }

  async handleWebhook(dto: PaymentWebhookDto) {
    const payment = await this.paymentRepository.findOne({
      where: { booking_id: dto.booking_id },
      relations: ['booking', 'booking.trip'],
    });

    if (!payment) throw new NotFoundException('Payment record not found');

    if (dto.status === 'success') {
      payment.gateway_txn_id = dto.gateway_txn_id;
      payment.status = PaymentStatus.HELD; // Confirmed held
      await this.paymentRepository.save(payment);

      // Notify owner and passenger
      await this.notificationService.sendNotification(
        payment.booking.passenger_id,
        NotificationType.BOOKING_ACCEPTED,
        'Payment Confirmed',
        `Payment of PKR ${payment.amount} confirmed and held in escrow.`
      );
      await this.notificationService.sendNotification(
        payment.booking.trip.owner_id,
        NotificationType.BOOKING_REQUEST,
        'Payment Received',
        `Passenger has paid PKR ${payment.amount}. Funds are held in escrow until trip completion.`
      );
    }

    return { status: 'ok' };
  }

  async release(bookingId: number, ownerId: number) {
    return await this.dataSource.transaction(async (manager) => {
      const payment = await manager.findOne(Payment, {
        where: { booking_id: bookingId },
        relations: ['booking', 'booking.trip'],
      });

      if (!payment) throw new NotFoundException('Payment not found');
      if (payment.booking.trip.owner_id !== ownerId) throw new ForbiddenException('Only the trip owner can release funds');
      if (payment.booking.status !== BookingStatus.COMPLETED) throw new BadRequestException('Funds can only be released for completed bookings');
      if (payment.status !== PaymentStatus.HELD) throw new BadRequestException('Payment is not in HELD status');

      payment.status = PaymentStatus.RELEASED;
      payment.released_at = new Date();
      await manager.save(payment);

      // Mock gateway transfer logic here
      console.log(`[MOCK GATEWAY] Transferring PKR ${payment.net_amount} to owner ${ownerId}`);

      await this.notificationService.sendNotification(
        ownerId,
        NotificationType.PAYMENT_RELEASED,
        'Payment Released',
        `Funds of PKR ${payment.net_amount} have been released to your wallet.`
      );

      return payment;
    });
  }

  async handleCancellationRefund(bookingId: number, cancelledBy: 'passenger' | 'owner') {
    const payment = await this.paymentRepository.findOne({
      where: { booking_id: bookingId },
      relations: ['booking', 'booking.trip'],
    });

    if (!payment || payment.status !== PaymentStatus.HELD) return;

    if (cancelledBy === 'passenger') {
      // 80% refund to passenger, 20% to owner (simplified)
      const refundAmount = payment.amount * 0.8;
      const ownerCompensation = payment.amount * 0.2;
      
      payment.status = PaymentStatus.REFUNDED;
      await this.paymentRepository.save(payment);

      console.log(`[MOCK GATEWAY] Refunding PKR ${refundAmount} to passenger and PKR ${ownerCompensation} to owner`);
    } else {
      // Full refund to passenger
      payment.status = PaymentStatus.REFUNDED;
      await this.paymentRepository.save(payment);

      console.log(`[MOCK GATEWAY] Refunding full PKR ${payment.amount} to passenger due to owner cancellation`);
    }
  }
}
