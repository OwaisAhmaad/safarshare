import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationGateway } from './location.gateway';
import { LocationService } from './location.service';
import { Booking } from '../booking/entities/booking.entity';
import { Trip } from '../trip/entities/trip.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, Trip]),
  ],
  providers: [LocationGateway, LocationService],
  exports: [LocationService],
})
export class LocationModule {}
