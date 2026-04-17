import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TwilioProvider {
  private readonly logger = new Logger(TwilioProvider.name);

  async sendSms(phoneNumber: string, message: string): Promise<void> {
    // Mock Twilio implementation
    this.logger.log(`[MOCK TWILIO] Sending SMS to ${phoneNumber}: ${message}`);
  }
}
