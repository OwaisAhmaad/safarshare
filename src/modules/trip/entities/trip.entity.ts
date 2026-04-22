import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Vehicle, VehicleType } from '../../vehicle/entities/vehicle.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum TripStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum PriceModel {
  PER_SEAT = 'per_seat',
  PER_KG = 'per_kg',
  PER_RIDE = 'per_ride',
  MIXED = 'mixed',
}

@Entity('trips')
export class Trip {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  @Index()
  owner_id: number;

  @ApiProperty()
  @Column()
  vehicle_id: number;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @ApiProperty({ type: () => Vehicle })
  @ManyToOne(() => Vehicle)
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @ApiProperty()
  @Column()
  @Index()
  from_city: string;

  @ApiProperty()
  @Column()
  @Index()
  to_city: string;

  @ApiProperty()
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  from_location: string;

  @ApiProperty()
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  to_location: string;

  @ApiProperty()
  @Column({ type: 'timestamp' })
  @Index()
  departure_time: Date;

  @ApiProperty()
  @Column()
  available_seats: number;

  @ApiProperty()
  @Column({ type: 'float', nullable: true })
  available_cargo_kg: number;

  @ApiProperty({ enum: PriceModel })
  @Column({
    type: 'enum',
    enum: PriceModel,
  })
  price_model: PriceModel;

  @ApiProperty()
  @Column({ type: 'float', nullable: true })
  price_per_seat: number;

  @ApiProperty()
  @Column({ type: 'float', nullable: true })
  price_per_kg: number;

  @ApiProperty()
  @Column({ type: 'float', nullable: true })
  price_per_ride: number;

  @ApiProperty({ enum: VehicleType })
  @Column({
    type: 'enum',
    enum: VehicleType,
  })
  vehicle_type: VehicleType;

  @ApiProperty({ enum: TripStatus })
  @Column({
    type: 'enum',
    enum: TripStatus,
    default: TripStatus.ACTIVE,
  })
  @Index()
  status: TripStatus;

  @ApiProperty()
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  last_shared_location: string;

  @ApiProperty()
  @CreateDateColumn()
  created_at: Date;
}
