import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
import { ConfigsService } from '@configs';
import { PushNotificationDto } from '@dto/notification';

@Injectable()
export class NotificationsService {
  constructor(private readonly configsService: ConfigsService) {
    const adminConfig: ServiceAccount = {
      projectId: this.configsService.get('FIREBASE_PROJECT_ID'),
      privateKey: this.configsService
        .get('FIREBASE_PRIVATE_KEY')
        .replace(/\\n/g, '\n'),
      clientEmail: this.configsService.get('FIREBASE_CLIENT_EMAIL'),
    };
    admin.initializeApp({
      credential: admin.credential.cert(adminConfig),
      databaseURL: this.configsService.get('DATABASE_URL'),
    });
  }

  public async sendNotification(
    notification: PushNotificationDto,
  ): Promise<void> {
    try {
      const { title, body, token } = notification;
      const payload = {
        notification: {
          title,
          body,
        },
      };
      await Promise.all([admin.messaging().sendToDevice(token, payload)]);
      return;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }
}
