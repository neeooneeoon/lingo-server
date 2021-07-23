import { ApiProperty } from '@nestjs/swagger';
export class UserAddress {
  @ApiProperty({ type: Number, default: -1 })
  province: number;
  @ApiProperty({ type: Number, default: -1 })
  district: number;
}
