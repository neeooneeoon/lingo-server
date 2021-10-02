import { FollowingsService } from '@libs/followings/providers/followings.service';
import { Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';

@Processor('following')
export class FollowingProcessor {
  private readonly logger = new Logger(FollowingProcessor.name);

  constructor(private readonly followingService: FollowingsService) {}
}
