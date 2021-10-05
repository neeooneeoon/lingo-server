export class GroupDeviceToken {
  user: string;
  items: Array<{
    token: string;
    createdAt: Date;
  }>;
}
