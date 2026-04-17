import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Vehicle, VehicleType } from '../../vehicle/entities/vehicle.entity';

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
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  owner_id: number;

  @Column()
  vehicle_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @ManyToOne(() => Vehicle)
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @Column()
  @Index()
  from_city: string;

  @Column()
  @Index()
  to_city: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  from_location: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  to_location: string;

  @Column({ type: 'timestamp' })
  @Index()
  departure_time: Date;

  @Column()
  available_seats: number;

  @Column({ type: 'float', nullable: true })
  available_cargo_kg: number;

  @Column({
    type: 'enum',
    enum: PriceModel,
  })
  price_model: PriceModel;

  @Column({ type: 'float', nullable: true })
  price_per_seat: number;

  @Column({ type: 'float', nullable: true })
  price_per_kg: number;

  @Column({ type: 'float', nullable: true })
  price_per_ride: number;

  @Column({
    type: 'enum',
    enum: VehicleType,
  })
  vehicle_type: VehicleType;

  @Column({
    type: 'enum',
    enum: TripStatus,
    default: TripStatus.ACTIVE,
  })
  @Index()
  status: TripStatus;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  last_shared_location: string;

  @CreateDateColumn()
  created_at: Date;
}
