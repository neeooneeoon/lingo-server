import { ApiProperty } from '@nestjs/swagger';

export class DistrictItemDto {
  @ApiProperty({ type: Number, required: true })
  _id: number;

  @ApiProperty({ type: String, required: true })
  name: string;
}
