import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
import { ConfigsService } from '@configs';
import { PushNotificationDto } from '@dto/notification';
import { InjectModel } from '@nestjs/mongoose';
import { DeviceToken, DeviceTokenDocument } from '@entities/deviceToken.entity';
import { Model, Types } from 'mongoose';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
      await admin.messaging().sendToDevice(token, payload);
      return;
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException(e);
    }
  }

  public async storeDeviceToken(
    userId: string,
    token: string,
  ): Promise<DeviceTokenDocument> {
    if (token) {
      const deviceToken = await this.deviceTokenModel.findOne({
        token: token,
      });
      if (deviceToken) return deviceToken;
      return this.deviceTokenModel.create({
        user: Types.ObjectId(userId),
        token: token,
      });
    }
  }

  public async scheduleNotifications() {
    const devices = await this.deviceTokenModel.find({}).populate('user');
    const enableDevices = devices.map((device) => device.token);
    await Promise.all(
      enableDevices.map((token) =>
        this.sendNotification({
          token: token,
          title: '⏰ Nhắc nhở hằng ngày. ',
          body: 'Bạn chỉ cần dành ra 10 phút mỗi ngày để nâng cao kỹ năng Tiếng Anh. Bắt đầu thôi!',
        }),
      ),
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
