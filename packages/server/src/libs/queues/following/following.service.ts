import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
export class FollowingQueueService {
  constructor(
    @InjectQueue('following') private readonly followingQueue: Queue,
  ) {}
}
