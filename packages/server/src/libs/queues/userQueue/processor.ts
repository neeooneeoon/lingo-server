import { UsersService } from '@libs/users/providers/users.service';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('user')
export class UserProcessor {
  constructor(private usersService: UsersService) {}

  @Process('updateRanking')
  async handleUpdateRanking(job: Job) {
    await this.usersService.groupUsers();
    return;
  }
}
