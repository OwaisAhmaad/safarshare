import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Rating } from './entities/rating.entity';
import { CreateRatingDto } from './dto/rating.dto';
import { Booking, BookingStatus } from '../booking/entities/booking.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(Rating)
    private ratingRepository: Repository<Rating>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  async create(fromUserId: number, dto: CreateRatingDto): Promise<Rating> {
    const booking = await this.bookingRepository.findOne({
      where: { id: dto.booking_id },
      relations: ['trip'],
    });

    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestException('You can only rate completed bookings');
    }

    const isPassenger = booking.passenger_id === fromUserId;
    const isOwner = booking.trip.owner_id === fromUserId;

    if (!isPassenger && !isOwner) {
      throw new ForbiddenException('You are not a participant of this booking');
    }

    const toUserId = isPassenger ? booking.trip.owner_id : booking.passenger_id;

    // Check for existing rating
    const existing = await this.ratingRepository.findOne({
      where: { booking_id: dto.booking_id, from_user_id: fromUserId },
    });
    if (existing) throw new BadRequestException('You have already rated this booking');

    return await this.dataSource.transaction(async (manager) => {
      const rating = manager.create(Rating, {
        booking_id: dto.booking_id,
        from_user_id: fromUserId,
        to_user_id: toUserId,
        rating: dto.rating,
        review: dto.review,
      });

      const savedRating = await manager.save(rating);

      // Recalculate average rating for the target user
      const { avg } = await manager
        .createQueryBuilder(Rating, 'rating')
        .select('AVG(rating.rating)', 'avg')
        .where('rating.to_user_id = :toUserId', { toUserId })
        .getRawOne();

      await manager.update(User, toUserId, {
        avg_rating: parseFloat(parseFloat(avg).toFixed(2)),
      });

      return savedRating;
    });
  }

  async findByUser(userId: number, page = 1, limit = 10): Promise<{ data: Rating[]; total: number }> {
    const [data, total] = await this.ratingRepository.findAndCount({
      where: { to_user_id: userId },
      relations: ['from_user'],
      order: { created_at: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return { data, total };
  }

  async findByBooking(bookingId: number): Promise<Rating[]> {
    return this.ratingRepository.find({
      where: { booking_id: bookingId },
      relations: ['from_user', 'to_user'],
    });
  }
}
