import { WorkInfo } from '@dto/works';
import { UserProfile } from '@dto/user/userProfile.dto';

export class UpdateUserStatusDto {
  user: UserProfile & { _id: string };
  workInfo: WorkInfo;
  isFinishLevel: boolean;
  point: number;
}
