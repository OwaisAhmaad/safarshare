import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { NotificationGateway } from './notification.gateway';
import { FcmProvider } from './providers/fcm.provider';
import { TwilioProvider } from './providers/twilio.provider';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private notificationGateway: NotificationGateway,
    private fcmProvider: FcmProvider,
    private twilioProvider: TwilioProvider,
    @InjectQueue('notifications') private notificationQueue: Queue,
  ) {}

  async sendNotification(
    userId: number,
    type: NotificationType,
    title: string,
    body: string,
    metadata?: any
  ): Promise<Notification> {
    // 1. Save to DB (In-app)
    const notification = this.notificationRepository.create({
      user_id: userId,
      type,
      title,
      body,
    });
    const savedNotification = await this.notificationRepository.save(notification);

    // 2. Send via Socket.io (Real-time in-app)
    this.notificationGateway.sendNotification(userId.toString(), {
      id: savedNotification.id,
      title,
      body,
      type,
      created_at: savedNotification.created_at,
    });

    // 3. Send Push (Mock FCM)
    await this.fcmProvider.sendPushNotification(userId.toString(), title, body);

    // 4. Send SMS if critical (Mock Twilio)
    if (type === NotificationType.BOOKING_ACCEPTED || type === NotificationType.TRIP_REMINDER) {
      // In real app, fetch user phone number
      await this.twilioProvider.sendSms('+923000000000', `${title}: ${body}`);
    }

    return savedNotification;
  }

  async findAll(userId: number, unreadOnly = false): Promise<Notification[]> {
    const where: any = { user_id: userId };
    if (unreadOnly) {
      where.is_read = false;
    }
    return this.notificationRepository.find({
      where,
      order: { created_at: 'DESC' },
    });
  }

  async markAsRead(id: number, userId: number): Promise<void> {
    await this.notificationRepository.update({ id, user_id: userId }, { is_read: true });
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationRepository.update({ user_id: userId }, { is_read: true });
  }

  async scheduleTripReminder(userId: number, tripId: number, departureTime: Date) {
    const delay = departureTime.getTime() - Date.now() - (2 * 60 * 60 * 1000); // 2 hours before
    if (delay > 0) {
      await this.notificationQueue.add(
        'trip-reminder',
        { userId, tripId, title: 'Trip Reminder', body: 'Your trip starts in 2 hours!' },
        { delay }
      );
    }
  }
}
