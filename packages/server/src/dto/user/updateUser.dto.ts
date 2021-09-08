import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@utils/enums';

export class UpdateUserDto {
  @ApiProperty({ type: String, required: false })
  givenName?: string;

  @ApiProperty({ type: String, required: false })
  familyName?: string;

  @ApiProperty({ type: String, required: true })
  displayName: string;

  @ApiProperty({ type: Date, required: false })
  birthday?: Date;

  @ApiProperty({ type: Number, required: true, default: 1 })
  grade: number;

  @ApiProperty({ type: Number, required: true })
  provinceId: number;

  @ApiProperty({ type: Number, required: true })
  districtId: number;

  @ApiProperty({ type: Number, required: true })
  schoolId: number;

  @ApiProperty({ type: String, enum: Role, required: true })
  role: Role;
}
