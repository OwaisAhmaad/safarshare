import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { NotificationService } from './notification.service';
import { NotificationType } from './entities/notification.entity';
import { Logger } from '@nestjs/common';

@Processor('notifications')
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(private readonly notificationService: NotificationService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);

    switch (job.name) {
      case 'trip-reminder':
        await this.notificationService.sendNotification(
          job.data.userId,
          NotificationType.TRIP_REMINDER,
          job.data.title,
          job.data.body
        );
        break;
      default:
        this.logger.warn(`Unknown job type: ${job.name}`);
    }
  }
}
