import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigsService } from '@configs';
import { PushNotificationDto } from '@dto/notification';
import { InjectModel } from '@nestjs/mongoose';
import { DeviceToken, DeviceTokenDocument } from '@entities/deviceToken.entity';
import { LeanDocument, Model, Types } from 'mongoose';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  NotificationDocument,
  Notification,
} from '@entities/notification.entity';
import { CreateNotificationTemplateDto } from '@dto/notification/createNotificationTemplate.dto';
import { messaging } from 'firebase-admin/lib/messaging';
import { UsersService } from '@libs/users/providers/users.service';
import { UserDocument } from '@entities/user.entity';
import { FollowingsService } from '@libs/followings/providers/followings.service';
import { GroupDeviceToken } from '@dto/notification';
import { MAX_DEVICE_MULTICAST } from '../constants';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly configsService: ConfigsService,
    @InjectModel(DeviceToken.name)
    private deviceTokenModel: Model<DeviceTokenDocument>,
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    private followingsService: FollowingsService,
    @Inject(forwardRef(() => UsersService)) private usersService: UsersService,
  ) {}

  public async groupDeviceTokens(): Promise<GroupDeviceToken[]> {
    const groups: GroupDeviceToken[] = await this.deviceTokenModel.aggregate([
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $group: {
          _id: {
            user: '$user',
          },
          items: {
            $push: {
              token: '$token',
              createdAt: '$createdAt',
            },
          },
        },
      },
      {
        $project: {
          user: '$_id.user',
          items: '$items',
          _id: 0,
        },
      },
    ]);
    return groups.filter((element) => element.items?.length > 0);
  }

  public async getDeviceToken(objectMessage: {
    currentUser: string;
    message: string;
  }) {
    const devices = await this.deviceTokenModel
      .find({
        user: { $eq: Types.ObjectId(objectMessage.currentUser) },
      })
      .sort({ createdAt: 1 });
    const total = devices?.length;
    if (total > 0) {
      const latestDevice = devices[total - 1];
      return {
        token: latestDevice.token,
        notification: {
          title: '🔥🔥🔥 THI ĐUA NGAY',
          body: objectMessage.message,
        },
      };
    }
    return undefined;
  }

  public async getListNotifications(): Promise<{
    notifications: LeanDocument<NotificationDocument>[];
    total: number;
  }> {
    const list = await this.notificationModel
      .find({})
      .select({ __v: 0 })
      .lean();
    return {
      notifications: list,
      total: list?.length,
    };
  }

  public async pushNotification(id: string) {
    const [notification, devices] = (await Promise.all([
      this.notificationModel.findById(id).select({ __v: 0, _id: 0 }).lean(),
      this.deviceTokenModel.find().lean(),
    ])) as [
      messaging.NotificationMessagePayload,
      LeanDocument<DeviceTokenDocument>[],
    ];
    if (notification && devices?.length > 0) {
      for (const key in notification) {
        if (notification.hasOwnProperty(key) && !notification[key])
          delete notification[key];
      }
      console.log(notification);
      const tokens = devices.map((device) => device?.token);
      await Promise.all(
        tokens.map((token) =>
          admin.messaging().sendToDevice(token, {
            notification: { ...notification },
          }),
        ),
      );
    }
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
  public async sendMulticast(
    tokens: string[],
    message: messaging.MessagingPayload,
  ): Promise<void> {
    await admin.messaging().sendToDevice(tokens, message);
    return;
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

  public async sendStaticMessage(message: messaging.MessagingPayload) {
    const groups = await this.groupDeviceTokens();
    const devicesSet = new Set<string>();
    groups.forEach((element) => {
      const token = element?.items[0]?.token;
      if (token) devicesSet.add(token);
    });
    const latestDevices = [...devicesSet];
    if (latestDevices.length <= MAX_DEVICE_MULTICAST) {
      await this.sendMulticast(latestDevices, message);
    } else {
      const remainder =
        Math.floor(latestDevices.length / MAX_DEVICE_MULTICAST) + 1;
      const listGroupDevices: Array<Array<string>> = [];
      for (let i = 0; i < remainder; i++) {
        const multicastDevices = latestDevices.slice(
          i * MAX_DEVICE_MULTICAST,
          (i + 1) * MAX_DEVICE_MULTICAST,
        );
        if (multicastDevices?.length > 0) {
          listGroupDevices.push(multicastDevices);
        }
      }

      await Promise.all(
        listGroupDevices.map((element) => this.sendMulticast(element, message)),
      );
    }
  }

  public async sendNotificationTest() {
    const devices = await this.deviceTokenModel.find({
      user: Types.ObjectId('60e3cc151f2d656c247426ce'),
    });
    const enableDevices = devices.map((device) => device.token);
    await Promise.all(
      enableDevices.map((token) =>
        this.sendNotification({
          token: token,
          title: '⏰ Nhắc nhở hằng ngày.',
          body: 'Bạn chỉ cần dành ra 10 phút mỗi ngày để nâng cao kỹ năng Tiếng Anh. Bắt đầu thôi!',
        }),
      ),
    );
  }
  public removeDeviceToken(currentUser: string): Observable<boolean> {
    return from(
      this.deviceTokenModel.deleteMany({
        user: Types.ObjectId(currentUser),
      }),
    ).pipe(
      map((deleteResult) => {
        if (deleteResult.deletedCount >= 1) return true;
        throw new InternalServerErrorException();
      }),
    );
  }

  public async createNewNotification(
    body: CreateNotificationTemplateDto,
  ): Promise<NotificationDocument> {
    try {
      return this.notificationModel.create(body);
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  public async deleteNotification(
    notificationId: string,
  ): Promise<{ success: boolean; status: number }> {
    try {
      const deleteResult = await this.notificationModel.deleteOne({
        _id: Types.ObjectId(notificationId),
      });
      if (deleteResult?.ok === 1) {
        return {
          success: true,
          status: 200,
        };
      }
      return {
        success: false,
        status: 500,
      };
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  public async updateNotificationTemplate(
    id: string,
    body: CreateNotificationTemplateDto,
  ): Promise<{ success: boolean; status: number }> {
    try {
      const updateResult = await this.notificationModel.updateOne(
        {
          _id: Types.ObjectId(id),
        },
        {
          $set: {
            ...body,
          },
        },
      );
      if (updateResult.nModified === 1) {
        return {
          success: true,
          status: 200,
        };
      }
      return {
        success: false,
        status: 500,
      };
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  public async scoreReminderNotification() {
    const users = await this.usersService.findAll();
    const followingResults = await Promise.all(
      users.map((user) =>
        this.followingsService.getAllFollowings(String(user._id)),
      ),
    );
    const messageObject: Array<{ currentUser: string; message: string }> = [];
    if (followingResults?.length > 0) {
      followingResults.map((item) => {
        if (item) {
          const followings = item?.followings;
          const firstUser = followings[0].followUser as unknown as UserDocument;
          const total = followings?.length;
          let message: string;
          if (total == 1) {
            message = `${firstUser.displayName} đã vượt qua số điểm của bạn. Hãy bắt đầu thi đua ngay.`;
            messageObject.push({
              currentUser: item.currentUser,
              message: message,
            });
          } else if (total > 1) {
            message = `${firstUser.displayName} và ${
              total - 1
            } người dùng khác đã vượt qua số điểm của bạn. Hãy bắt đầu thi đua ngay.`;
            messageObject.push({
              currentUser: item.currentUser,
              message: message,
            });
          } else {
            message = 'Cải thiện điểm số của mình ngay nào.';
            messageObject.push({
              currentUser: item.currentUser,
              message,
            });
          }
        }
      });
    }
    if (messageObject.length > 0) {
      const MAX_MESSAGES = 500;
      const list = (
        await Promise.all(
          messageObject.map((element) => this.getDeviceToken(element)),
        )
      ).filter((element) => element !== undefined);
      if (list.length > 0) {
        const remainder = Math.floor(list.length / MAX_MESSAGES) + 1;
        const groupMessages: Array<Array<messaging.Message>> = [];
        for (let i = 0; i < remainder; i++) {
          groupMessages.push(
            list.slice(i * MAX_MESSAGES, (i + 1) * MAX_MESSAGES),
          );
        }
        await Promise.all(
          groupMessages.map((group) => {
            return admin.messaging().sendAll(group);
          }),
        );
      }
    }
  }
}
