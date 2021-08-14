import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
export class MailService {
  constructor(@InjectQueue('mail') private mailQueue: Queue) {}

  async sendInvitationEmail(
    inviter: string,
    receiver: string,
  ): Promise<boolean> {
    try {
      await this.mailQueue.add('invitation', {
        inviter,
        receiver,
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}
