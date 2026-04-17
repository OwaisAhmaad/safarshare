import { Controller, Get, Post, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { RatingService } from './rating.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateRatingDto } from './dto/rating.dto';

@ApiTags('ratings')
@Controller('ratings')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Rate a completed booking' })
  create(@CurrentUser('userId') userId: number, @Body() createRatingDto: CreateRatingDto) {
    return this.ratingService.create(userId, createRatingDto);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all ratings for a specific user' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.ratingService.findByUser(userId, page, limit);
  }

  @Get('booking/:bookingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get ratings for a specific booking' })
  findByBooking(@Param('bookingId', ParseIntPipe) bookingId: number) {
    return this.ratingService.findByBooking(bookingId);
  }
}
