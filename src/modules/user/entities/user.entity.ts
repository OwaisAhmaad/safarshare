import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  OWNER = 'owner',
  PASSENGER = 'passenger',
  BOTH = 'both',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ unique: true })
  phone: string;

  @ApiProperty()
  @Column({ unique: true, nullable: true })
  email: string;

  @ApiProperty()
  @Column({ nullable: true })
  full_name: string;

  @Column({ nullable: true, select: false })
  cnic_hash: string;

  @ApiProperty()
  @Column({ default: false })
  cnic_verified: boolean;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  cnic_photo_front: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  cnic_photo_back: string;

  @ApiProperty()
  @Column({ nullable: true })
  avatar_url: string;

  @ApiProperty({ enum: UserRole })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.PASSENGER,
  })
  role: UserRole;

  @ApiProperty()
  @Column({ type: 'float', default: 0 })
  avg_rating: number;

  @ApiProperty()
  @Column({ default: false })
  is_blocked: boolean;

  @ApiProperty()
  @CreateDateColumn()
  created_at: Date;
}
