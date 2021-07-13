import { WorkInfo } from '@dto/works';
import { UserDocument } from '@entities/user.entity';

export class UpdateUserStatusDto {
  user: UserDocument;
  workInfo: WorkInfo;
  isFinishLevel: boolean;
  point: number;
}
