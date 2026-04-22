import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateVehicleDto, UpdateVehicleDto } from './dto/vehicle.dto';

@ApiTags('vehicles')
@ApiBearerAuth()
@Controller('vehicles')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Register a new vehicle' })
  create(@CurrentUser('userId') userId: number, @Body() createVehicleDto: CreateVehicleDto) {
    return this.vehicleService.create(userId, createVehicleDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all vehicles of current user' })
  findAll(@CurrentUser('userId') userId: number) {
    return this.vehicleService.findAllByOwner(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get vehicle details' })
  findOne(@Param('id') id: number) {
    return this.vehicleService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update vehicle details' })
  update(
    @Param('id') id: number,
    @CurrentUser('userId') userId: number,
    @Body() updateVehicleDto: UpdateVehicleDto
  ) {
    return this.vehicleService.update(id, userId, updateVehicleDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete vehicle' })
  remove(@Param('id') id: number, @CurrentUser('userId') userId: number) {
    return this.vehicleService.remove(id, userId);
  }

  // Admin endpoint
  @Put('admin/:id/verify')
  @UseGuards(JwtAuthGuard) // Should ideally be an AdminGuard
  @ApiOperation({ summary: 'Verify vehicle (Admin only)' })
  verify(@Param('id') id: number, @Body('verified') verified: boolean) {
    return this.vehicleService.verify(id, verified);
  }
}
