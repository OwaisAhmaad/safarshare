import { Injectable, BadRequestException, NotFoundException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThan } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { CreateBookingDto } from './dto/booking.dto';
import { TripService } from '../trip/trip.service';
import { Trip, PriceModel } from '../trip/entities/trip.entity';
import { VehicleType } from '../vehicle/entities/vehicle.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '../notification/entities/notification.entity';
import { PaymentService } from '../payment/payment.service';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    private tripService: TripService,
    private dataSource: DataSource,
    private notificationService: NotificationService,
    @Inject(forwardRef(() => PaymentService))
    private paymentService: PaymentService,
  ) {}

  async create(passengerId: number, tripId: number, dto: CreateBookingDto): Promise<Booking> {
    const trip = await this.tripService.findOne(tripId);

    if (trip.owner_id === passengerId) {
      throw new BadRequestException('You cannot book your own trip');
    }

    const seats = dto.seats || 0;
    const cargo_kg = dto.cargo_kg || 0;

    // 1. Validate based on vehicle type
    if (trip.vehicle_type === VehicleType.BIKE) {
      if (seats !== 1 || cargo_kg > 0) {
        throw new BadRequestException('Bikes only allow 1 seat and no cargo');
      }
    }

    if (trip.vehicle_type === VehicleType.SUZUKI_CARRY) {
      if (seats > 0 && cargo_kg > 0) {
        throw new BadRequestException('Suzuki Carry bookings must be either seats or cargo, not both (MVP)');
      }
    }

    // 2. Check availability
    if (seats > trip.available_seats) {
      throw new BadRequestException('Not enough seats available');
    }
    if (cargo_kg > trip.available_cargo_kg) {
      throw new BadRequestException('Not enough cargo space available');
    }

    // 3. Calculate total price
    const totalPrice = this.calculatePrice(trip, seats, cargo_kg);

    const booking = this.bookingRepository.create({
      trip_id: tripId,
      passenger_id: passengerId,
      seats,
      cargo_kg,
      total_price: totalPrice,
      status: BookingStatus.PENDING,
    });

    const savedBooking = await this.bookingRepository.save(booking);

    // 4. Notify owner
    await this.notificationService.sendNotification(
      trip.owner_id,
      NotificationType.BOOKING_REQUEST,
      'New Booking Request',
      `New booking request for your trip from ${trip.from_city} to ${trip.to_city}`
    );

    return savedBooking;
  }

  private calculatePrice(trip: Trip, seats: number, cargo: number): number {
    switch (trip.price_model) {
      case PriceModel.PER_SEAT:
        return seats * (trip.price_per_seat || 0);
      case PriceModel.PER_KG:
        return cargo * (trip.price_per_kg || 0);
      case PriceModel.PER_RIDE:
        return trip.price_per_ride || 0;
      case PriceModel.MIXED:
        return (seats * (trip.price_per_seat || 0)) + (cargo * (trip.price_per_kg || 0));
      default:
        return 0;
    }
  }

  async accept(bookingId: number, ownerId: number): Promise<Booking> {
    return await this.dataSource.transaction(async (manager) => {
      const booking = await manager.findOne(Booking, {
        where: { id: bookingId },
        relations: ['trip'],
      });

      if (!booking) throw new NotFoundException('Booking not found');
      if (booking.trip.owner_id !== ownerId) throw new ForbiddenException('Only trip owner can accept bookings');
      if (booking.status !== BookingStatus.PENDING) throw new BadRequestException('Only pending bookings can be accepted');

      // Re-check availability within transaction
      const trip = await manager.findOne(Trip, { where: { id: booking.trip_id } });
      if (booking.seats > trip.available_seats || booking.cargo_kg > trip.available_cargo_kg) {
        throw new BadRequestException('Not enough capacity available on trip');
      }

      // Update trip capacity
      await manager.update(Trip, trip.id, {
        available_seats: trip.available_seats - booking.seats,
        available_cargo_kg: trip.available_cargo_kg - booking.cargo_kg,
      });

      // Update booking status
      booking.status = BookingStatus.ACCEPTED;
      const updatedBooking = await manager.save(booking);

      // Notify passenger
      await this.notificationService.sendNotification(
        booking.passenger_id,
        NotificationType.BOOKING_ACCEPTED,
        'Booking Accepted',
        `Your booking for trip to ${trip.to_city} has been accepted!`
      );

      return updatedBooking;
    });
  }

  async reject(bookingId: number, ownerId: number): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['trip'],
    });

    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.trip.owner_id !== ownerId) throw new ForbiddenException('Only trip owner can reject bookings');
    if (booking.status !== BookingStatus.PENDING) throw new BadRequestException('Only pending bookings can be rejected');

    booking.status = BookingStatus.REJECTED;
    const saved = await this.bookingRepository.save(booking);

    await this.notificationService.sendNotification(
      booking.passenger_id,
      NotificationType.BOOKING_REJECTED,
      'Booking Rejected',
      `Your booking for trip to ${booking.trip.to_city} was rejected.`
    );

    return saved;
  }

  async complete(bookingId: number, ownerId: number): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['trip'],
    });

    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.trip.owner_id !== ownerId) throw new ForbiddenException('Only trip owner can complete bookings');
    if (booking.status !== BookingStatus.ACCEPTED) throw new BadRequestException('Only accepted bookings can be completed');

    booking.status = BookingStatus.COMPLETED;
    return this.bookingRepository.save(booking);
  }

  async cancel(bookingId: number, userId: number): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['trip'],
    });

    if (!booking) throw new NotFoundException('Booking not found');
    
    const isPassenger = booking.passenger_id === userId;
    const isOwner = booking.trip.owner_id === userId;

    if (!isPassenger && !isOwner) {
      throw new ForbiddenException('You can only cancel your own bookings or trips');
    }

    if (booking.status === BookingStatus.CANCELLED || booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException('Booking cannot be cancelled in current status');
    }

    // Handle capacity restoration if it was accepted
    if (booking.status === BookingStatus.ACCEPTED) {
      await this.dataSource.transaction(async (manager) => {
        const trip = await manager.findOne(Trip, { where: { id: booking.trip_id } });
        await manager.update(Trip, trip.id, {
          available_seats: trip.available_seats + booking.seats,
          available_cargo_kg: trip.available_cargo_kg + booking.cargo_kg,
        });
      });
    }

    booking.status = BookingStatus.CANCELLED;
    const saved = await this.bookingRepository.save(booking);

    // Handle Payment Refund
    await this.paymentService.handleCancellationRefund(bookingId, isPassenger ? 'passenger' : 'owner');

    // Notify other party
    const otherPartyId = isPassenger ? booking.trip.owner_id : booking.passenger_id;
    await this.notificationService.sendNotification(
      otherPartyId,
      isPassenger ? NotificationType.BOOKING_REJECTED : NotificationType.BOOKING_REJECTED, // Using REJECTED as a placeholder for cancellation
      'Booking Cancelled',
      `Booking for trip to ${booking.trip.to_city} has been cancelled by the ${isPassenger ? 'passenger' : 'owner'}.`
    );

    return saved;
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleAutoCancellation() {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const pendingBookings = await this.bookingRepository.find({
      where: {
        status: BookingStatus.PENDING,
        created_at: LessThan(oneHourAgo),
      },
    });

    for (const booking of pendingBookings) {
      booking.status = BookingStatus.CANCELLED;
      await this.bookingRepository.save(booking);
      console.log(`Auto-cancelled pending booking ${booking.id}`);
    }
  }
}
