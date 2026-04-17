import { Controller, Post, Body, Put, Param, UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateBookingDto } from './dto/booking.dto';

@ApiTags('bookings')
@ApiBearerAuth()
@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('trip/:tripId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Request a booking for a trip' })
  create(
    @CurrentUser('userId') userId: number,
    @Param('tripId') tripId: number,
    @Body() createBookingDto: CreateBookingDto,
  ) {
    return this.bookingService.create(userId, tripId, createBookingDto);
  }

  @Put(':id/accept')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Accept a pending booking (Owner only)' })
  accept(@Param('id') id: number, @CurrentUser('userId') userId: number) {
    return this.bookingService.accept(id, userId);
  }

  @Put(':id/reject')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Reject a pending booking (Owner only)' })
  reject(@Param('id') id: number, @CurrentUser('userId') userId: number) {
    return this.bookingService.reject(id, userId);
  }

  @Put(':id/complete')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mark booking as completed after trip (Owner only)' })
  complete(@Param('id') id: number, @CurrentUser('userId') userId: number) {
    return this.bookingService.complete(id, userId);
  }

  @Put(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cancel a booking (Passenger or Owner)' })
  cancel(@Param('id') id: number, @CurrentUser('userId') userId: number) {
    return this.bookingService.cancel(id, userId);
  }
}
