import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
export class UserQueueService {
  constructor(@InjectQueue('user') private userQueue: Queue) {}
  async updateRanking() {
    await this.userQueue.add('updateRanking', {}, { priority: 1 });
  }
}
