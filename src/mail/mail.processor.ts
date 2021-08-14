import { MailerService } from '@nestjs-modules/mailer'
import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common'
import {
  ANDROID_URL,
  DEFAULT_AVATAR,
  IOS_URL,
  WEB_URL,
} from '@utils/constants';
import { Job } from 'bull'


@Processor('mail')
export class MailProcessor {
  private readonly logger = new Logger(this.constructor.name)

  constructor(private readonly mailerService: MailerService) {}

  @Process('invitation')
  async sendInvitationEmail(
    job: Job<{ inviter: string; receiver: string }>,
  ): Promise<any> {
    this.logger.log(`Sending invitation email to '${job.data.receiver}'`)
    try {
      const result = await this.mailerService.sendMail({
        template: './invitation',
        context: {
          receiver: job.data.receiver,
          inviter: job.data.inviter,
          androidUrl: ANDROID_URL,
          iosUrl: IOS_URL,
          webUrl: WEB_URL,
          logo:
            process.env.NODE_ENV == 'production'
              ? 'https://lingo-api.saokhuee.com/images/logo.svg'
              : 'http://localhost:8080/images/logo.svg',
        },
        subject: `Chào mừng đến với lingo`,
        to: job.data.receiver,
      })
      return result;

    } catch (error) {
      this.logger.error(
        `Failed to send invitation email to '${job.data.receiver}'`,
        error.stack,
      );
      throw error;
    }
  }
}