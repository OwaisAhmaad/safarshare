import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationGateway } from './notification.gateway';
import { Notification } from './entities/notification.entity';
import { FcmProvider } from './providers/fcm.provider';
import { TwilioProvider } from './providers/twilio.provider';
import { NotificationProcessor } from './notification.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    BullModule.registerQueue({
      name: 'notifications',
    }),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationGateway,
    FcmProvider,
    TwilioProvider,
    NotificationProcessor,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
