import { Controller, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserQueueService } from './service';

@Controller('api/user/queue')
@ApiTags('User/Queue')
export class UserQueueController {
  constructor(private readonly userQueueService: UserQueueService) {}
  @Put('updateRanking')
  async updateRanking() {
    return this.userQueueService.updateRanking();
  }
}
