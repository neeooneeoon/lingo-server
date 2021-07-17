import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
import { ConfigsService } from '@configs';
import { PushNotificationDto } from '@dto/notification';
import { InjectModel } from '@nestjs/mongoose';
import { DeviceToken, DeviceTokenDocument } from '@entities/deviceToken.entity';
import { Model, Types } from 'mongoose';
import { forkJoin, from, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { UserDocument } from '@entities/user.entity';

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
            user: Types.ObjectId(userId),
            token: token,
          });
        }
      }),
    );
  }
  public scheduleNotifications(): Observable<void[]> {
    return from(this.deviceTokenModel.find({}).populate('user')).pipe(
      map((deviceTokens) => {
        const enableDevices: string[] = [];
        deviceTokens.map((deviceToken) => {
          const user = deviceToken.user as unknown as UserDocument;
          user.enableNotification && enableDevices.push(deviceToken.token);
        });
        return enableDevices;
      }),
      switchMap((enableDevices) => {
        return forkJoin([
          ...enableDevices.map((device) => {
            return this.sendNotification({
              token: device,
              title: 'Nhắc nhở mỗi ngày',
              body: 'Lingo xin chào!',
            });
          }),
        ]);
      }),
    );
  }
  public removeDeviceToken(currentUser: string): Observable<boolean> {
    return from(
      this.deviceTokenModel.deleteOne({
        user: Types.ObjectId(currentUser),
      }),
    ).pipe(
      map((deleteResult) => {
        if (deleteResult.deletedCount === 1) return true;
        throw new InternalServerErrorException();
      }),
    );
  }
}
