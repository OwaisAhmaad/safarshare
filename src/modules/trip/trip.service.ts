import { Injectable, BadRequestException, NotFoundException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, In, SelectQueryBuilder } from 'typeorm';
import { Trip, TripStatus, PriceModel } from './entities/trip.entity';
import { CreateTripDto, SearchTripDto } from './dto/trip.dto';
import { VehicleService } from '../vehicle/vehicle.service';
import { VehicleType } from '../vehicle/entities/vehicle.entity';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class TripService {
  constructor(
    @InjectRepository(Trip)
    private tripRepository: Repository<Trip>,
    private vehicleService: VehicleService,
    @Inject(forwardRef(() => NotificationService))
    private notificationService: NotificationService,
  ) {}

  async create(ownerId: number, createTripDto: CreateTripDto): Promise<Trip> {
    const vehicle = await this.vehicleService.findOne(createTripDto.vehicle_id);
    
    if (vehicle.owner_id !== ownerId) {
      throw new ForbiddenException('You can only post trips with your own vehicles');
    }

    if (!vehicle.verified) {
      throw new BadRequestException('Vehicle must be verified before posting a trip');
    }

    // Validate Price Model
    this.validatePriceModel(vehicle.vehicle_type, createTripDto);

    const trip = this.tripRepository.create({
      ...createTripDto,
      owner_id: ownerId,
      vehicle_type: vehicle.vehicle_type,
      available_seats: vehicle.total_seats,
      available_cargo_kg: vehicle.max_cargo_kg,
      status: TripStatus.ACTIVE,
    });

    // Handle PostGIS coordinates if provided
    if (createTripDto.from_lat && createTripDto.from_lng) {
      trip.from_location = `POINT(${createTripDto.from_lng} ${createTripDto.from_lat})`;
    }
    if (createTripDto.to_lat && createTripDto.to_lng) {
      trip.to_location = `POINT(${createTripDto.to_lng} ${createTripDto.to_lat})`;
    }

    const savedTrip = await this.tripRepository.save(trip);

    // Schedule reminder for owner
    await this.notificationService.scheduleTripReminder(
      ownerId,
      savedTrip.id,
      new Date(savedTrip.departure_time)
    );

    return savedTrip;
  }

  private validatePriceModel(vehicleType: VehicleType, dto: CreateTripDto) {
    switch (vehicleType) {
      case VehicleType.CAR:
      case VehicleType.HIACE:
      case VehicleType.COASTER:
      case VehicleType.FLYING_COACH:
        if (dto.price_model !== PriceModel.PER_SEAT || !dto.price_per_seat) {
          throw new BadRequestException(`${vehicleType} requires price_model=per_seat and price_per_seat`);
        }
        break;
      case VehicleType.BIKE:
        if (dto.price_model !== PriceModel.PER_RIDE || !dto.price_per_ride) {
          throw new BadRequestException(`Bike requires price_model=per_ride and price_per_ride`);
        }
        break;
      case VehicleType.SUZUKI_CARRY:
        if (dto.price_model === PriceModel.PER_SEAT && !dto.price_per_seat) {
          throw new BadRequestException('Suzuki Carry with per_seat model requires price_per_seat');
        }
        if (dto.price_model === PriceModel.PER_KG && !dto.price_per_kg) {
          throw new BadRequestException('Suzuki Carry with per_kg model requires price_per_kg');
        }
        if (dto.price_model === PriceModel.MIXED && (!dto.price_per_seat || !dto.price_per_kg)) {
          throw new BadRequestException('Suzuki Carry with mixed model requires both price_per_seat and price_per_kg');
        }
        break;
    }
  }

  async search(query: SearchTripDto): Promise<Trip[]> {
    const qb = this.tripRepository.createQueryBuilder('trip');
    
    qb.leftJoinAndSelect('trip.vehicle', 'vehicle')
      .leftJoinAndSelect('trip.owner', 'owner')
      .where('trip.status = :status', { status: TripStatus.ACTIVE })
      .andWhere('trip.departure_time >= :now', { now: new Date() });

    if (query.from_city) {
      qb.andWhere('trip.from_city ILIKE :from_city', { from_city: `%${query.from_city}%` });
    }

    if (query.to_city) {
      qb.andWhere('trip.to_city ILIKE :to_city', { to_city: `%${query.to_city}%` });
    }

    if (query.date) {
      const start = new Date(query.date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(query.date);
      end.setHours(23, 59, 59, 999);
      qb.andWhere('trip.departure_time BETWEEN :start AND :end', { start, end });
    }

    if (query.vehicle_types && query.vehicle_types.length > 0) {
      qb.andWhere('trip.vehicle_type IN (:...types)', { types: query.vehicle_types });
    }

    if (query.min_price) {
      qb.andWhere('(trip.price_per_seat >= :min OR trip.price_per_ride >= :min)', { min: query.min_price });
    }

    if (query.max_price) {
      qb.andWhere('(trip.price_per_seat <= :max OR trip.price_per_ride <= :max)', { max: query.max_price });
    }

    qb.orderBy('trip.departure_time', 'ASC');

    return qb.getMany();
  }

  async findOne(id: number): Promise<Trip> {
    const trip = await this.tripRepository.findOne({
      where: { id },
      relations: ['vehicle', 'owner'],
    });
    if (!trip) {
      throw new NotFoundException(`Trip with ID ${id} not found`);
    }
    return trip;
  }

  async cancel(id: number, ownerId: number): Promise<Trip> {
    const trip = await this.findOne(id);
    if (trip.owner_id !== ownerId) {
      throw new ForbiddenException('You can only cancel your own trips');
    }
    trip.status = TripStatus.CANCELLED;
    return this.tripRepository.save(trip);
  }
}
