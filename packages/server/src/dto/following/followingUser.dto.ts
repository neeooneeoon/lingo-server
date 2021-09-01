import { ApiProperty } from '@nestjs/swagger';

export class FollowingUser {
  @ApiProperty({ type: [String], required: false, default: [] })
  tags?: string[];

  @ApiProperty({ type: String, required: true })
  _id: string;

  @ApiProperty({ type: String, required: true })
  user: string;

  @ApiProperty({ type: String, required: true })
  followUser: string;

  @ApiProperty({ type: String, required: false })
  __v?: any;
}
