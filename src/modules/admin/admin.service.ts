import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Vehicle } from '../vehicle/entities/vehicle.entity';
import { Trip } from '../trip/entities/trip.entity';
import { Booking } from '../booking/entities/booking.entity';
import { Payment, PaymentStatus } from '../payment/entities/payment.entity';
import { Rating } from '../rating/entities/rating.entity';
import { AdminUserFilterDto } from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Trip)
    private tripRepository: Repository<Trip>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Rating)
    private ratingRepository: Repository<Rating>,
    private dataSource: DataSource,
  ) {}

  async getUsers(filter: AdminUserFilterDto) {
    const { page, limit, verified, blocked } = filter;
    const qb = this.userRepository.createQueryBuilder('user');

    if (verified !== undefined) {
      qb.andWhere('user.cnic_verified = :verified', { verified });
    }

    if (blocked !== undefined) {
      qb.andWhere('user.is_blocked = :blocked', { blocked });
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('user.created_at', 'DESC')
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async verifyCnic(userId: number, verified: boolean) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    user.cnic_verified = verified;
    return this.userRepository.save(user);
  }

  async blockUser(userId: number, blocked: boolean) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    user.is_blocked = blocked;
    return this.userRepository.save(user);
  }

  async getUnverifiedVehicles() {
    return this.vehicleRepository.find({ where: { verified: false } });
  }

  async verifyVehicle(vehicleId: number) {
    const vehicle = await this.vehicleRepository.findOne({ where: { id: vehicleId } });
    if (!vehicle) throw new NotFoundException('Vehicle not found');

    vehicle.verified = true;
    return this.vehicleRepository.save(vehicle);
  }

  async getTrips(page = 1, limit = 10) {
    const [data, total] = await this.tripRepository.findAndCount({
      relations: ['owner', 'vehicle'],
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return { data, total, page, limit };
  }

  async getStats() {
    const totalUsers = await this.userRepository.count();
    const totalTrips = await this.tripRepository.count();
    const totalBookings = await this.bookingRepository.count();

    const releasedPayments = await this.paymentRepository.find({
      where: { status: PaymentStatus.RELEASED },
    });

    const totalRevenue = releasedPayments.reduce((acc, p) => acc + p.amount, 0);
    const totalCommission = releasedPayments.reduce((acc, p) => acc + p.commission, 0);

    return {
      totalUsers,
      totalTrips,
      totalBookings,
      totalRevenue,
      totalCommission,
    };
  }

  async getDisputes() {
    return this.bookingRepository.createQueryBuilder('booking')
      .leftJoinAndSelect('booking.trip', 'trip')
      .leftJoinAndSelect('booking.passenger', 'passenger')
      .leftJoin('ratings', 'rating', 'rating.booking_id = booking.id')
      .where('booking.is_disputed = :isDisputed', { isDisputed: true })
      .orWhere('rating.rating < :minRating', { minRating: 2 })
      .getMany();
  }

  async resolveDispute(bookingId: number) {
    const booking = await this.bookingRepository.findOne({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');

    booking.is_disputed = false;
    return this.bookingRepository.save(booking);
  }
}
