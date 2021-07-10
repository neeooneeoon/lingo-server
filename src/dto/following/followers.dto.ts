import { FollowingDocument } from '@entities/following.entity';
import { ApiProperty } from '@nestjs/swagger';

export class FollowersDto {
  @ApiProperty({ type: 'array', required: true })
  items: FollowingDocument[];
}
