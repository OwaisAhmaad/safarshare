import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Trip } from '../../trip/entities/trip.entity';
import { User } from '../../user/entities/user.entity';

export enum BookingStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  trip_id: number;

  @Column()
  @Index()
  passenger_id: number;

  @ManyToOne(() => Trip)
  @JoinColumn({ name: 'trip_id' })
  trip: Trip;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'passenger_id' })
  passenger: User;

  @Column({ default: 0 })
  seats: number;

  @Column({ type: 'float', default: 0 })
  cargo_kg: number;

  @Column({ type: 'float' })
  total_price: number;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  @Index()
  status: BookingStatus;

  @Column({ nullable: true })
  payment_id: string;

  @Column({ default: false })
  is_disputed: boolean;

  @CreateDateColumn()
  created_at: Date;
}
