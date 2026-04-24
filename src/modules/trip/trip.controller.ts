import { Controller, Get, Post, Body, Put, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TripService } from './trip.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateTripDto, SearchTripDto } from './dto/trip.dto';
import { Trip } from './entities/trip.entity';

@ApiTags('trips')
@Controller('trips')
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Post a new trip' })
  @ApiResponse({ status: 201, description: 'Trip created successfully', type: Trip })
  create(@CurrentUser('userId') userId: number, @Body() createTripDto: CreateTripDto) {
    return this.tripService.create(userId, createTripDto);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search for active trips' })
  @ApiResponse({ status: 200, description: 'List of trips matching criteria', type: [Trip] })
  search(@Query() query: SearchTripDto) {
    return this.tripService.search(query);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current driver's posted trips" })
  findMine(@CurrentUser('userId') userId: number) {
    return this.tripService.findByOwner(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get trip details' })
  @ApiResponse({ status: 200, description: 'Trip details found', type: Trip })
  @ApiResponse({ status: 404, description: 'Trip not found' })
  findOne(@Param('id') id: number) {
    return this.tripService.findOne(id);
  }

  @Put(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a trip' })
  @ApiResponse({ status: 200, description: 'Trip cancelled successfully' })
  cancel(@Param('id') id: number, @CurrentUser('userId') userId: number) {
    return this.tripService.cancel(id, userId);
  }
}
