import { ApiProperty } from '@nestjs/swagger';

export class UserTag {
  @ApiProperty({ type: String, required: true })
  _id: string;

  @ApiProperty({ type: String, required: true })
  user: string;

  @ApiProperty({ type: String, required: true })
  name: string;

  @ApiProperty({ type: String, required: true })
  color: string;
}
