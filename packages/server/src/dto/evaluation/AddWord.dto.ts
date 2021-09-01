import { ApiProperty } from '@nestjs/swagger';

export class AddWordDto {
  @ApiProperty({ type: String, required: true })
  _id: string;

  @ApiProperty({ type: String, required: true })
  content: string;

  @ApiProperty({ type: String, required: true })
  meaning: string;

  @ApiProperty({ type: String, required: true, default: '' })
  imageRoot: string;

  @ApiProperty({ type: String, required: true })
  bookId: string;

  @ApiProperty({ type: String, required: true })
  unitId: string;

  @ApiProperty({ type: Number, required: true })
  level: number;

  @ApiProperty({ type: [String], required: true })
  codes: Array<string>;
}
