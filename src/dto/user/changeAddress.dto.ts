import { ApiProperty } from '@nestjs/swagger';

export class ChangeAddressDto {
  @ApiProperty({ type: Number, required: true })
  provinceId: number;

  @ApiProperty({ type: Number, required: true })
  districtId: number;

  @ApiProperty({type: Number, required: true})
  schoolId: number;
}
