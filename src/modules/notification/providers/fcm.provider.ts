import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class FcmProvider {
  private readonly logger = new Logger(FcmProvider.name);

  async sendPushNotification(userId: string, title: string, body: string): Promise<void> {
    // Mock FCM implementation
    this.logger.log(`[MOCK FCM] Sending push to user ${userId}: ${title} - ${body}`);
  }
}
