import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, DeleteDateColumn } from 'typeorm';

export enum VehicleType {
  CAR = 'car',
  SUZUKI_CARRY = 'suzuki_carry',
  HIACE = 'hiace',
  COASTER = 'coaster',
  FLYING_COACH = 'flying_coach',
  BIKE = 'bike',
}

export enum VehicleCategory {
  PASSENGER = 'passenger',
  MIXED = 'mixed',
  TWO_WHEELER = 'two_wheeler',
}

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  owner_id: number;

  @Column({
    type: 'enum',
    enum: VehicleType,
  })
  vehicle_type: VehicleType;

  @Column({
    type: 'enum',
    enum: VehicleCategory,
  })
  category: VehicleCategory;

  @Column()
  make: string;

  @Column()
  model: string;

  @Column()
  year: number;

  @Column()
  color: string;

  @Column({ unique: true })
  plate_number: string;

  @Column()
  total_seats: number;

  @Column({ type: 'float', nullable: true })
  max_cargo_kg: number;

  @Column({ default: false })
  has_ac: boolean;

  @Column({ nullable: true })
  engine_cc: number;

  @Column({ type: 'simple-array', nullable: true })
  photos: string[];

  @Column({ default: false })
  verified: boolean;

  @CreateDateColumn()
  created_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
