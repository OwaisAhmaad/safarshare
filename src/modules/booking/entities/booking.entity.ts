import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Trip } from '../../trip/entities/trip.entity';
import { User } from '../../user/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum BookingStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Entity('bookings')
export class Booking {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  @Index()
  trip_id: number;

  @ApiProperty()
  @Column()
  @Index()
  passenger_id: number;

  @ApiProperty({ type: () => Trip })
  @ManyToOne(() => Trip)
  @JoinColumn({ name: 'trip_id' })
  trip: Trip;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'passenger_id' })
  passenger: User;

  @ApiProperty()
  @Column({ default: 0 })
  seats: number;

  @ApiProperty()
  @Column({ type: 'float', default: 0 })
  cargo_kg: number;

  @ApiProperty()
  @Column({ type: 'float' })
  total_price: number;

  @ApiProperty({ enum: BookingStatus })
  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  @Index()
  status: BookingStatus;

  @ApiProperty()
  @Column({ nullable: true })
  payment_id: string;

  @ApiProperty()
  @Column({ default: false })
  is_disputed: boolean;

  @ApiProperty()
  @CreateDateColumn()
  created_at: Date;
}
