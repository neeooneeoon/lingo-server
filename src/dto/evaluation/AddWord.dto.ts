import { ApiProperty } from '@nestjs/swagger';

export class AddWordDto {
  @ApiProperty({ type: String, required: true })
  id: string;

  @ApiProperty({ type: [String], required: true })
  codes: Array<string>;

  @ApiProperty({ type: String, required: true })
  content: string;

  @ApiProperty({ type: String, required: true })
  meaning: string;

  @ApiProperty({ type: String, required: true, default: '' })
  imageRoot: string;

  @ApiProperty({ type: Number, required: true })
  proficiency: number;

  @ApiProperty({ type: String, required: true })
  bookId: string;

  @ApiProperty({ type: String, required: true })
  unitId: string;

  @ApiProperty({ type: Number, required: true })
  level: number;
}
