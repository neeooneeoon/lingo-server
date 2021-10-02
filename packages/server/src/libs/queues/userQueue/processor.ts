import { UsersService } from '@libs/users/providers/users.service';
import { Process, Processor } from '@nestjs/bull';

@Processor('user')
export class UserProcessor {
  constructor(private usersService: UsersService) {}

  @Process('updateRanking')
  async handleUpdateRanking() {
    await this.usersService.groupUsers();
    return;
  }
}
