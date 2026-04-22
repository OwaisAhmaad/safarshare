import { IsString, IsNumber, IsDateString, IsEnum, IsOptional, IsArray, Min, Max, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PriceModel, TripStatus } from '../entities/trip.entity';
import { VehicleType } from '../../vehicle/entities/vehicle.entity';

export class CreateTripDto {
  @ApiProperty()
  @IsNumber()
  vehicle_id: number;

  @ApiProperty()
  @IsString()
  from_city: string;

  @ApiProperty()
  @IsString()
  to_city: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  from_lat?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  from_lng?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  to_lat?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  to_lng?: number;

  @ApiProperty()
  @IsDateString()
  departure_time: string;

  @ApiProperty({ enum: PriceModel })
  @IsEnum(PriceModel)
  price_model: PriceModel;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price_per_seat?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price_per_kg?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price_per_ride?: number;
}

export class SearchTripDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  from_city?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  to_city?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsEnum(VehicleType, { each: true })
  vehicle_types?: VehicleType[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  min_price?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  max_price?: number;
}

export class UpdateTripStatusDto {
  @ApiProperty({ enum: TripStatus })
  @IsEnum(TripStatus)
  status: TripStatus;
}
