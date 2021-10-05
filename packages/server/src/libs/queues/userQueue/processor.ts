import { UsersService } from '@libs/users/providers/users.service';
import { Process, Processor } from '@nestjs/bull';
import { BadRequestException, Logger } from '@nestjs/common';

@Processor('user')
export class UserProcessor {
  private readonly logger = new Logger(UserProcessor.name);
  constructor(private usersService: UsersService) {}

  @Process('updateRanking')
  async handleUpdateRanking() {
    try {
      this.logger.debug('Start updateRanking');
      await this.usersService.groupUsers(true);
      await this.usersService.groupUsers(false);
      this.logger.debug('updateRanking Done');
      return;
    } catch (error) {
      this.logger.debug(error);
      throw new BadRequestException(error);
    }
  }
  @Process('pushProfile')
  async handlePushProfile() {
    try {
      this.logger.debug('Start pushProfile');
      await this.usersService.pushToCache();
      this.logger.debug('done pushProfile');
      return;
    } catch (error) {
      this.logger.debug(error);
      throw new BadRequestException(error);
    }
  }

  @Process('changeStreakScore')
  async handleChangeStreakScore() {
    try {
      this.logger.debug('Start changeStreakScore');
      const users = await this.usersService.getAllUsers();
      await Promise.all(
        users.map((user) =>
          this.usersService.changeUserStreak(
            String(user._id),
            Number(user.streak),
          ),
        ),
      );
    } catch (error) {
      this.logger.debug(error);
    }
  }
}
