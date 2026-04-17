import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Booking } from '../../booking/entities/booking.entity';
import { User } from '../../user/entities/user.entity';

@Entity('ratings')
@Index(['booking_id', 'from_user_id'], { unique: true })
export class Rating {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  booking_id: number;

  @ManyToOne(() => Booking)
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Column()
  @Index()
  from_user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'from_user_id' })
  from_user: User;

  @Column()
  @Index()
  to_user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'to_user_id' })
  to_user: User;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  review: string;

  @CreateDateColumn()
  created_at: Date;
}
