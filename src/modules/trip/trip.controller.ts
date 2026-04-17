import { Controller, Get, Post, Body, Put, Param, Query, UseGuards } from '@nestjs/common';
import { TripService } from './trip.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateTripDto, SearchTripDto } from './dto/trip.dto';

@ApiTags('trips')
@Controller('trips')
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Post a new trip' })
  create(@CurrentUser('userId') userId: number, @Body() createTripDto: CreateTripDto) {
    return this.tripService.create(userId, createTripDto);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search for active trips' })
  search(@Query() query: SearchTripDto) {
    return this.tripService.search(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get trip details' })
  findOne(@Param('id') id: number) {
    return this.tripService.findOne(id);
  }

  @Put(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a trip' })
  cancel(@Param('id') id: number, @CurrentUser('userId') userId: number) {
    return this.tripService.cancel(id, userId);
  }
}
