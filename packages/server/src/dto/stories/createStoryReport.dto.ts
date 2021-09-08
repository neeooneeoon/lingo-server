import { ApiProperty } from '@nestjs/swagger';

export class CreateStoryReportDto {
  @ApiProperty({ type: String, required: true })
  storyQuestion: string;

  @ApiProperty({ type: [String], required: false })
  contents: Array<string>;

  @ApiProperty({ type: String, required: false })
  comment: string;
}
