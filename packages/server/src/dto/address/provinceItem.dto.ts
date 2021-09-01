import { ApiProperty } from '@nestjs/swagger';

export class ProvinceItemDto {
  @ApiProperty({ type: Number, required: true })
  _id: number;

  @ApiProperty({ type: String, required: true })
  name: string;
}
