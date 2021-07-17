import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
import { ConfigsService } from '@configs';
import { PushNotificationDto } from '@dto/notification';
import { InjectModel } from '@nestjs/mongoose';
import { DeviceToken, DeviceTokenDocument } from '@entities/deviceToken.entity';
import { Model, Types } from 'mongoose';
import { forkJoin, from, Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly configsService: ConfigsService,
    @InjectModel(DeviceToken.name)
    private deviceTokenModel: Model<DeviceTokenDocument>,
  ) {
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
  public saveDeviceToken(
    userId: string,
    token: string,
  ): Observable<DeviceTokenDocument> {
    return from(
      this.deviceTokenModel.findOne({
        token: token,
      }),
    ).pipe(
      switchMap((deviceToken) => {
        if (deviceToken) {
          return of(deviceToken);
        } else {
          return this.deviceTokenModel.create({
            user: Types.ObjectId('userId'),
            token: token,
          });
        }
      }),
    );
  }
  public scheduleNotifications(): Observable<void[]> {
    // from(
    //   this.deviceTokenModel.find({}).populate('User').select('enableNotification')
    // ).pipe)
    return from(this.deviceTokenModel.find()).pipe(
      switchMap((deviceTokens) => {
        return forkJoin(
          deviceTokens.map((deviceToken) => {
            return this.sendNotification({
              token: deviceToken.token,
              title: 'Nhắc nhở mỗi ngày',
              body: 'Lingo xin chào!',
            });
          }),
        );
      }),
    );
  }
}
