import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { User } from '../user/entities/user.entity';
import { Vehicle } from '../vehicle/entities/vehicle.entity';
import { Trip } from '../trip/entities/trip.entity';
import { Booking } from '../booking/entities/booking.entity';
import { Payment } from '../payment/entities/payment.entity';
import { Rating } from '../rating/entities/rating.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Vehicle, Trip, Booking, Payment, Rating]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
