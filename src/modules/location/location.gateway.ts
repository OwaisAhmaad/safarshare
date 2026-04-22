import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LocationService } from './location.service';
import { UseGuards, UnauthorizedException } from '@nestjs/common';
import { WsJwtGuard } from '../../common/guards/ws-jwt.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking, BookingStatus } from '../booking/entities/booking.entity';
import { Repository } from 'typeorm';
import { Trip, TripStatus } from '../trip/entities/trip.entity';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'location',
})
export class LocationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly locationService: LocationService,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Trip)
    private tripRepository: Repository<Trip>,
  ) {}

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('owner:join_trip')
  async handleOwnerJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { bookingId: number },
  ) {
    const booking = await this.validateBooking(data.bookingId);
    // In a real app, verify client.user.id matches trip owner
    const room = `trip_${data.bookingId}`;
    client.join(room);
    console.log(`Owner joined room: ${room}`);
    return { status: 'joined' };
  }

  @SubscribeMessage('passenger:join_trip')
  async handlePassengerJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { bookingId: number },
  ) {
    const booking = await this.validateBooking(data.bookingId);
    const room = `trip_${data.bookingId}`;
    client.join(room);
    console.log(`Passenger joined room: ${room}`);
    
    // Send last known location if exists
    const lastLocation = await this.locationService.getLocation(data.bookingId);
    if (lastLocation) {
      client.emit('location:updated', lastLocation);
    }
    
    return { status: 'joined' };
  }

  @SubscribeMessage('location:update')
  async handleLocationUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { bookingId: number, lat: number, lng: number },
  ) {
    const booking = await this.validateBooking(data.bookingId);
    
    // Save to Redis
    await this.locationService.saveLocation(data.bookingId, data.lat, data.lng);

    // Broadcast to room
    const room = `trip_${data.bookingId}`;
    this.server.to(room).emit('location:updated', {
      lat: data.lat,
      lng: data.lng,
      timestamp: new Date()
    });
    
    return { status: 'broadcasted' };
  }

  @SubscribeMessage('owner:leave_trip')
  async handleOwnerLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { bookingId: number },
  ) {
    const room = `trip_${data.bookingId}`;
    client.leave(room);
    
    // Optional: Persist final location to DB if trip is finished
    const booking = await this.bookingRepository.findOne({
      where: { id: data.bookingId },
      relations: ['trip']
    });
    
    if (booking && booking.trip) {
       const lastLoc = await this.locationService.getLocation(data.bookingId);
       if (lastLoc) {
         await this.tripRepository.update(booking.trip.id, {
           last_shared_location: `POINT(${lastLoc.lng} ${lastLoc.lat})`
         });
       }
    }

    await this.locationService.clearLocation(data.bookingId);
    console.log(`Owner left room and cleaned up: ${room}`);
    return { status: 'left' };
  }

  private async validateBooking(bookingId: number) {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['trip']
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.status !== BookingStatus.ACCEPTED) {
       // Only allowed for accepted bookings (active trips)
       // trip status could also be checked
    }
    
    return booking;
  }
}
