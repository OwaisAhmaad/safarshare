import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, JoinColumn, Index } from 'typeorm';
import { Booking } from '../../booking/entities/booking.entity';

export enum PaymentStatus {
  HELD = 'held',
  RELEASED = 'released',
  REFUNDED = 'refunded',
  FAILED = 'failed',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  booking_id: number;

  @OneToOne(() => Booking)
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Column({ type: 'float' })
  amount: number;

  @Column({ type: 'float' })
  commission: number;

  @Column({ type: 'float' })
  net_amount: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.HELD,
  })
  @Index()
  status: PaymentStatus;

  @Column({ nullable: true })
  gateway_txn_id: string;

  @Column({ type: 'timestamp', nullable: true })
  released_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
