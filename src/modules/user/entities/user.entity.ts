import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum UserRole {
  OWNER = 'owner',
  PASSENGER = 'passenger',
  BOTH = 'both',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  phone: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ nullable: true })
  full_name: string;

  @Column({ nullable: true, select: false })
  cnic_hash: string;

  @Column({ default: false })
  cnic_verified: boolean;

  @Column({ type: 'text', nullable: true })
  cnic_photo_front: string;

  @Column({ type: 'text', nullable: true })
  cnic_photo_back: string;

  @Column({ nullable: true })
  avatar_url: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.PASSENGER,
  })
  role: UserRole;

  @Column({ type: 'float', default: 0 })
  avg_rating: number;

  @Column({ default: false })
  is_blocked: boolean;

  @CreateDateColumn()
  created_at: Date;
}
