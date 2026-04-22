import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Booking } from '../../booking/entities/booking.entity';
import { User } from '../../user/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('ratings')
@Index(['booking_id', 'from_user_id'], { unique: true })
export class Rating {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  @Index()
  booking_id: number;

  @ApiProperty({ type: () => Booking })
  @ManyToOne(() => Booking)
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @ApiProperty()
  @Column()
  @Index()
  from_user_id: number;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'from_user_id' })
  from_user: User;

  @ApiProperty()
  @Column()
  @Index()
  to_user_id: number;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'to_user_id' })
  to_user: User;

  @ApiProperty()
  @Column({ type: 'int' })
  rating: number;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  review: string;

  @ApiProperty()
  @CreateDateColumn()
  created_at: Date;
}
