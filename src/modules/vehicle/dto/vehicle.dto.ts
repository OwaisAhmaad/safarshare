import { IsEnum, IsString, IsNumber, IsBoolean, IsOptional, IsArray, Min, Max, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { VehicleType, VehicleCategory } from '../entities/vehicle.entity';

export class CreateVehicleDto {
  @ApiProperty({ enum: VehicleType })
  @IsEnum(VehicleType)
  vehicle_type: VehicleType;

  @ApiProperty({ enum: VehicleCategory })
  @IsEnum(VehicleCategory)
  category: VehicleCategory;

  @ApiProperty()
  @IsString()
  make: string;

  @ApiProperty()
  @IsString()
  model: string;

  @ApiProperty()
  @IsNumber()
  @Min(1990)
  @Max(new Date().getFullYear())
  year: number;

  @ApiProperty()
  @IsString()
  color: string;

  @ApiProperty()
  @IsString()
  plate_number: string;

  @ApiProperty()
  @IsNumber()
  @ValidateIf(o => o.vehicle_type === VehicleType.BIKE)
  @Min(1, { message: 'Bikes must have exactly 1 seat' })
  @Max(1, { message: 'Bikes must have exactly 1 seat' })
  @ValidateIf(o => [VehicleType.CAR, VehicleType.HIACE, VehicleType.COASTER, VehicleType.FLYING_COACH].includes(o.vehicle_type))
  @Min(2)
  @Max(30)
  total_seats: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @ValidateIf(o => o.vehicle_type === VehicleType.SUZUKI_CARRY)
  @Max(200, { message: 'Suzuki Carry max cargo is 200kg' })
  max_cargo_kg?: number;

  @ApiProperty()
  @IsBoolean()
  has_ac: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @ValidateIf(o => o.vehicle_type === VehicleType.BIKE)
  @Min(50)
  engine_cc?: number;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];
}

export class UpdateVehicleDto extends CreateVehicleDto {}
