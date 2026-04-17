import { IsBoolean, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AdminUserFilterDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  verified?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  blocked?: boolean;
}

export class VerifyCnicDto {
  @ApiProperty()
  @IsBoolean()
  verified: boolean;
}

export class BlockUserDto {
  @ApiProperty()
  @IsBoolean()
  blocked: boolean;
}

export class ResolveDisputeDto {
  @ApiProperty()
  @IsBoolean()
  resolved: boolean;
}
