import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, DeleteDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

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
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  owner_id: number;

  @ApiProperty({ enum: VehicleType })
  @Column({
    type: 'enum',
    enum: VehicleType,
  })
  vehicle_type: VehicleType;

  @ApiProperty({ enum: VehicleCategory })
  @Column({
    type: 'enum',
    enum: VehicleCategory,
  })
  category: VehicleCategory;

  @ApiProperty()
  @Column()
  make: string;

  @ApiProperty()
  @Column()
  model: string;

  @ApiProperty()
  @Column()
  year: number;

  @ApiProperty()
  @Column()
  color: string;

  @ApiProperty()
  @Column({ unique: true })
  plate_number: string;

  @ApiProperty()
  @Column()
  total_seats: number;

  @ApiProperty()
  @Column({ type: 'float', nullable: true })
  max_cargo_kg: number;

  @ApiProperty()
  @Column({ default: false })
  has_ac: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  engine_cc: number;

  @ApiProperty({ type: [String] })
  @Column({ type: 'simple-array', nullable: true })
  photos: string[];

  @ApiProperty()
  @Column({ default: false })
  verified: boolean;

  @ApiProperty()
  @CreateDateColumn()
  created_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
